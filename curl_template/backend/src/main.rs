#![allow(improper_ctypes)]

use fluence::fce;
use fluence::MountedBinaryStringResult as StringResult;
use fluence::MountedBinaryResult as Result;

fn main() {}

#[fce]
pub fn request(url: String) -> StringResult {
    unsafe { curl(vec!["-sS".into(), url]) }.stringify().unwrap()
}

// mounted_binaries are available to import like this:
#[fce]
#[link(wasm_import_module = "host")]
extern "C" {
    pub fn curl(cmd: Vec<String>) -> Result;
}
