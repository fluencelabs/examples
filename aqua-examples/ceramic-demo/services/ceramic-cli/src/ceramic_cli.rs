use marine_rs_sdk::{marine, MountedBinaryResult};

#[marine]
pub struct CeramicResult {
    pub ret_code: i32,
    pub stderr: String,
    pub stdout: String,
}

impl CeramicResult {
    fn new(mb: MountedBinaryResult) -> Self {
        CeramicResult {
            ret_code: mb.ret_code,
            stderr: String::from_utf8(mb.stderr).unwrap(),
            stdout: String::from_utf8(mb.stdout).unwrap(),
        }
    }

    fn create(ret_code: i32, stdout: String, stderr: String) -> Self {
        CeramicResult {
            ret_code,
            stderr,
            stdout,
        }
    }
}

#[marine]
pub fn ceramic_request(args: Vec<String>) -> CeramicResult {
    let response = ceramic(args);
    CeramicResult::new(response)
}

#[marine]
pub fn create_stream(payload: String) -> CeramicResult {
    let args = vec![
        "create".to_string(),
        "tile".to_string(),
        "--content".to_string(),
        payload,
    ];
    let response: MountedBinaryResult = ceramic(args);
    if response.stderr.len() > 0 {
        return CeramicResult::new(response);
    }
    let stdout_str: String = String::from_utf8(response.stdout).unwrap();

    if stdout_str.contains("StreamID") {
        let res: Vec<&str> = stdout_str.split("\n").collect();
        let stream_id = res[0].replace("StreamID(", "").replace(")", "");
        return CeramicResult::create(response.ret_code, stream_id.to_string(), "".to_string());
    } else {
        return CeramicResult::create(
            response.ret_code,
            "Missing StreamId".to_string(),
            "".to_string(),
        );
    }
}

#[marine]
pub fn show(args: Vec<String>) -> MountedBinaryResult {
    let response = ceramic(args);
    response
}

#[marine]
pub fn create_schema(schema: String) -> MountedBinaryResult {
    let args = vec![
        "create".to_string(),
        "tile".to_string(),
        "--content".to_string(),
        schema,
    ];
    let response = ceramic(args);
    response
}

// mounted_binaries are available to import like this:
#[marine]
#[link(wasm_import_module = "host")]
extern "C" {
    pub fn ceramic(cmd: Vec<String>) -> MountedBinaryResult;
}
