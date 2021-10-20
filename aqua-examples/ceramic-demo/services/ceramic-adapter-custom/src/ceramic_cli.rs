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
// general purpose function where all args need to be provided
// e.g., ["ceramic", "state", "stream_id"]
pub fn ceramic_request(args: Vec<String>) -> CeramicResult {
    let response: MountedBinaryResult = ceramic(args);
    CeramicResult::new(response)
}

#[marine]
// https://developers.ceramic.network/build/cli/quick-start/#2-create-a-stream
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
// https://developers.ceramic.network/build/cli/quick-start/#3-query-a-stream
pub fn show(stream_id: String) -> CeramicResult {
    let response: MountedBinaryResult = ceramic(vec!["show".to_string(), stream_id]);
    CeramicResult::new(response)
}

#[marine]
// https://developers.ceramic.network/build/cli/quick-start/#7-query-the-stream-you-created
pub fn state(stream_id: String) -> CeramicResult {
    let response: MountedBinaryResult = ceramic(vec!["state".to_string(), stream_id]);
    CeramicResult::new(response)
}

#[marine]
// https://developers.ceramic.network/build/cli/quick-start/#4-update-a-stream
pub fn update(stream_id: String, payload: String) -> CeramicResult {
    let response: MountedBinaryResult = ceramic(vec![
        "update".to_string(),
        stream_id,
        "--content".to_string(),
        payload,
    ]);
    CeramicResult::new(response)
}

#[marine]
// https://developers.ceramic.network/build/cli/quick-start/#5-create-a-schema
pub fn create_schema(schema: String) -> CeramicResult {
    let args = vec![
        "create".to_string(),
        "tile".to_string(),
        "--content".to_string(),
        schema,
    ];
    let response: MountedBinaryResult = ceramic(args);
    CeramicResult::new(response)
}

// mounted_binaries are available to import like this:
#[marine]
#[link(wasm_import_module = "host")]
extern "C" {
    pub fn ceramic(cmd: Vec<String>) -> MountedBinaryResult;
}
