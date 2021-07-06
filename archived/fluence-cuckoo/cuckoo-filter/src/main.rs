use cuckoofilter::{CuckooFilter, ExportedCuckooFilter};
use flate2::read::ZlibDecoder;
use flate2::write::ZlibEncoder;
use flate2::Compression;
use marine_rs_sdk::marine;
use serde::Serialize;
use serde_json;
use std::collections::hash_map::DefaultHasher;
use std::io::prelude::*;

type CF = CuckooFilter<DefaultHasher>;

fn main() {}

fn ser_cf(cf: CF) -> Vec<u8> {
    let exp_cf: ExportedCuckooFilter = cf.export();
    let ser_cf: String = serde_json::to_string(&exp_cf).unwrap();
    let mut e = ZlibEncoder::new(Vec::new(), Compression::default());
    e.write_all(&ser_cf.as_bytes());
    e.finish().unwrap()
}

fn de_cf(cf: Vec<u8>) -> Result<CF, String> {
    let mut zd = ZlibDecoder::new(&cf[..]);
    let mut string_buf = String::new();
    zd.read_to_string(&mut string_buf).unwrap();

    let ser: std::result::Result<ExportedCuckooFilter, serde_json::Error> =
        serde_json::from_str(&string_buf.as_str());
    if ser.is_err() {
        return Err(format!("Failed to deserialize cf: {:?}", cf));
    }

    Ok(cuckoofilter::CuckooFilter::<DefaultHasher>::from(
        ser.unwrap(),
    ))
}

#[marine]
pub fn create_cf(with_capacity: String) -> Vec<u8> {
    let capacity = with_capacity.parse::<u32>().unwrap();
    let cf = match capacity {
        0 => CuckooFilter::<DefaultHasher>::new(),
        _ => CuckooFilter::<DefaultHasher>::with_capacity(capacity as usize),
    };
    ser_cf(cf)
}

#[marine]
// one day, this may be available
// pub fn create_and_add_cf<T: ?Sized + Hash>(data: &T) -> String {
// until then, we use bytesrings although a json string of array of values should also work
// regardless, we lose some type discrimintation as 5u32 != 5u64 where in &[u8] it is.
pub fn create_and_add_cf(data: Vec<Vec<u8>>) -> Vec<u8> {
    let mut cf: CF = CuckooFilter::<DefaultHasher>::new();
    for v in data.iter() {
        cf.add(v);
    }
    ser_cf(cf)
}

#[marine]
pub fn add(cf: Vec<u8>, data: Vec<Vec<u8>>) -> Vec<u8> {
    let mut cf: CF = de_cf(cf).unwrap();
    let result = Vec::<bool>::new();
    for v in data.iter() {
        cf.add(v).unwrap();
        // TODO check for error
    }
    ser_cf(cf)
}

#[marine]
pub fn delete(cf: Vec<u8>, items: Vec<Vec<u8>>) -> Vec<bool> {
    let mut cf = de_cf(cf).unwrap();
    let mut result = Vec::<bool>::new();
    for item in items.iter() {
        result.push(cf.delete(item));
    }
    result
}

#[marine]
pub fn contains(cf: Vec<u8>, items: Vec<Vec<u8>>) -> Vec<bool> {
    let cf = de_cf(cf).unwrap();
    let mut result = Vec::<bool>::new();
    for item in items.iter() {
        result.push(cf.contains(item));
    }
    result
}

#[marine]
pub fn is_empty(cf: Vec<u8>) -> bool {
    let cf = de_cf(cf).unwrap();
    cf.is_empty()
}

#[marine]
pub fn memory_usage(cf: Vec<u8>) -> u64 {
    let cf = de_cf(cf).unwrap();
    cf.memory_usage() as u64
}

#[marine]
pub fn len(cf: Vec<u8>) -> u64 {
    let cf = de_cf(cf).unwrap();
    cf.len() as u64
}

#[marine]
pub fn service_info() -> String {
    #[derive(Serialize)]
    struct ServiceInfo {
        name: String,
        package: String,
        source: String,
        license: String,
        version: String,
    }

    let info = ServiceInfo {
        name: String::from("Cuckoo Filter"),
        package: String::from("https://crates.io/crates/cuckoofilter"),
        source: String::from("https://github.com/axiomhq/rust-cuckoofilter"),
        license: String::from("MIT"),
        version: String::from("0.5.0"),
    };

    serde_json::to_string(&info).unwrap()
}

/*
#[marine]
pub fn smoker() {
    let mut data: Vec<Vec<u8>> = Vec::new();
    data.push(5_u32.to_le_bytes().to_vec());
    data.push("hello".as_bytes().to_vec());
    data.push("fluence".as_bytes().to_vec());
    data.push(r#"{"result": 10.64}"#.as_bytes().to_vec());
}
*/
