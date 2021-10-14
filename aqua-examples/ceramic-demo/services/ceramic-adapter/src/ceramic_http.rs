use marine_rs_sdk::{marine, MountedBinaryResult};

// source: https://developers.ceramic.network/build/http/api/
static API: &str = "api";
static VERSION: &str = "v0";
static STREAM: &str = "streams";

fn url_maker(host: String, port: u32, arg: String, stream_id: String) -> String {
    format!(
        "http://{}:{}/{}/{}/{}/{}",
        host,
        port,
        API,
        VERSION,
        arg.to_uppercase(),
        stream_id,
    )
}

#[marine]
pub fn http_streams(url: String, port: u32, stream_id: String) -> String {
    // curl http://localhost:7007/api/v0/streams/kjzl6cwe1jw147r7878h32yazawcll6bxe5v92348cxitif6cota91qp68grbhm
    let url = url_maker(url, port, STREAM.to_string(), stream_id);
    let cmd = vec![url, "GET".to_string()];
    println!("cmd: {:?}", cmd);
    let response: MountedBinaryResult = curl_request(cmd);
    String::from_utf8(response.stdout).unwrap()
}

#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(cmd: Vec<String>) -> MountedBinaryResult;
}
