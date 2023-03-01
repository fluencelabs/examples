use marine_rs_sdk::{marine, MountedBinaryResult};

#[marine]
// general purpose request call where users provides the vector of
// properly formatted args
// e.g.,
pub fn ceramic_request(args: Vec<String>) -> MountedBinaryResult {
    ceramic(args)
}

#[marine]
pub fn create_stream(payload: String) -> MountedBinaryResult {
    let args = vec![
        "create".to_string(),
        "tile".to_string(),
        "--content".to_string(),
        payload,
    ];
    ceramic(args)
}

#[marine]
pub fn show(stream_id: String) -> MountedBinaryResult {
    ceramic(vec!["show".to_string(), stream_id])
}

#[marine]
pub fn state(stream_id: String) -> MountedBinaryResult {
    ceramic(vec!["state".to_string(), stream_id])
}

#[marine]
pub fn update(stream_id: String, payload: String) -> MountedBinaryResult {
    ceramic(vec![
        "update".to_string(),
        stream_id,
        "--content".to_string(),
        payload,
    ])
}

#[marine]
pub fn create_schema(schema: String) -> MountedBinaryResult {
    let args = vec![
        "create".to_string(),
        "tile".to_string(),
        "--content".to_string(),
        schema,
    ];
    ceramic(args)
}

// link to binary on host node with `extern` where the path comes from the
// config file. E.g., `/usr/bin/ceramic`
#[marine]
#[link(wasm_import_module = "host")]
extern "C" {
    pub fn ceramic(cmd: Vec<String>) -> MountedBinaryResult;
}
