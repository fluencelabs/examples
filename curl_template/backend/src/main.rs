#![allow(improper_ctypes)]

use fluence::marine;
use fluence::module_manifest;
use fluence::MountedBinaryResult;
use fluence::MountedBinaryStringResult;

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
