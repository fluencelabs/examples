use marine_rs_sdk::{marine, MountedBinaryResult};

static API: &str = "api";
static VERSION: &str = "v0";
static STREAM: &str = "streams";

fn url_maker(host: String, port: u32) -> String {
    format!("{}:{}/{}/{}/{}", host, port, API, VERSION, STREAM)
}

#[marine]
pub fn state(url: String, port: u32, payload: String) {
    let url = url_maker(url, port);
    let cmd = vec![url, "GET".to_string()];
    let response = curl_request(cmd);
}

#[marine]
pub fn show(url: String, stream_id: String) {}

#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(cmd: Vec<String>) -> MountedBinaryResult;
}
