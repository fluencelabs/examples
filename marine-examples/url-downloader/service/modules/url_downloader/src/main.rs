#![allow(improper_ctypes)]

use marine_rs_sdk::marine;
use marine_rs_sdk::module_manifest;
use marine_rs_sdk::WasmLoggerBuilder;

module_manifest!();

pub fn main() {
    WasmLoggerBuilder::new().build().unwrap();
}


#[marine]
pub struct PutResult {
    stdout: String,
    stderr: String, 
}

#[marine]
pub struct GetResult {
    stdout: Vec<u8>,
    stderr: String, 
}

/// Combining of modules: `curl` and `local_storage`.
/// Calls `curl` and stores returned result into a file.
#[marine]
pub fn get_n_save(url: String, file_name: String) -> PutResult {
    log::info!("get_n_save called with {} {}\n", url, file_name);

    let result = download(url);
    put(file_name, result.into_bytes())
}

#[marine]
pub fn put(file_name: String, file_content: Vec<u8>) -> PutResult {
    let res = file_put(file_name, file_content);

    if res == String::from("Ok") {
        PutResult { stdout: res, stderr: String::from("")}
    }
    else {
        PutResult { stdout: String::from(""), stderr: res}
    }
}

#[marine]
pub fn get(file_name: String) -> GetResult {
    let res = file_get(file_name);

    if res == b"error while reading file" {
        GetResult { stdout: vec!(), stderr: String::from_utf8(res).unwrap()}
    }
    else {
        GetResult { stdout: res, stderr: String::from("")}
    }
}

/// Importing `curl` module
#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn download(url: String) -> String;
}

/// Importing `local_storage` module
#[marine]
#[link(wasm_import_module = "local_storage")]
extern "C" {
    #[link_name = "get"]
    pub fn file_get(file_name: String) -> Vec<u8>;

    #[link_name = "put"]
    pub fn file_put(name: String, file_content: Vec<u8>) -> String;
}