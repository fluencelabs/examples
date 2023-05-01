use marine_rs_sdk::{marine, MountedBinaryResult};

#[marine]
#[link(wasm_import_module = "glaze_adapter")]
extern "C" {
    pub fn glaze_request(cmd: Vec<String>) -> MountedBinaryResult;
}