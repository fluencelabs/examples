use marine_rs_sdk::{marine, MountedBinaryResult};

pub fn main() {}

#[marine]
pub fn glaze_request(cmd: Vec<String>) -> MountedBinaryResult {
    glaze(cmd)
}

#[marine]
#[link(wasm_import_module = "host")]
extern "C" {
    pub fn glaze(cmd: Vec<String>) -> MountedBinaryResult;
}
