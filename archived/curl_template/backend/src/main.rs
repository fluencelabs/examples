#![allow(improper_ctypes)]

use marine_rs_sdk::marine;
use marine_rs_sdk::module_manifest;
use marine_rs_sdk::MountedBinaryResult;
use marine_rs_sdk::MountedBinaryStringResult;

module_manifest!();

fn main() {}

#[marine]
pub fn request(url: String) -> MountedBinaryStringResult {
    curl(vec!["-sS".into(), url]).stringify().unwrap()
}

// mounted_binaries are available to import like this:
#[marine]
#[link(wasm_import_module = "host")]
extern "C" {
    pub fn curl(cmd: Vec<String>) -> MountedBinaryResult;
}
