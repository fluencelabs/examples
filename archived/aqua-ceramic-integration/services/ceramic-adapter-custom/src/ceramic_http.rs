use marine_rs_sdk::{marine, MountedBinaryResult};

// source: https://developers.ceramic.network/build/http/api/
static API: &str = "api";
static VERSION: &str = "v0";
static STREAM: &str = "streams";

fn url_maker(host: String, port: u32, arg: String, stream_id: Option<String>) -> String {
    let curl_args = format!(
        "http://{}:{}/{}/{}/{}",
        host,
        port,
        API,
        VERSION,
        arg.to_uppercase(),
    );
    match stream_id {
        Some(sid) => format!("{}/{}", curl_args, sid),
        None => curl_args,
    }
}

#[marine]
pub fn http_streams(url: String, port: u32, stream_id: String) -> String {
    // curl http://localhost:7007/api/v0/streams/kjzl6cwe1jw147r7878h32yazawcll6bxe5v92348cxitif6cota91qp68grbhm
    let url = url_maker(url, port, STREAM.to_string(), Some(stream_id));
    let cmd = vec![url, "GET".to_string()];
    let response: MountedBinaryResult = curl_request(cmd);
    String::from_utf8(response.stdout).unwrap()
}

#[marine]
pub fn http_chain_id(url: String, port: u32) -> String {
    let url = url_maker(url, port, "NODE/CHAINS".to_string(), None);
    let cmd = vec![url, "GET".to_string()];
    println!("cmd: {:?}", cmd);
    let response: MountedBinaryResult = curl_request(cmd);
    String::from_utf8(response.stdout).unwrap()
}

#[marine]
pub fn http_health(url: String, port: u32) -> String {
    let url = url_maker(url, port, "NODE/HEALTHCHECK".to_string(), None);
    let cmd = vec![url, "GET".to_string()];
    println!("cmd: {:?}", cmd);
    let response: MountedBinaryResult = curl_request(cmd);
    String::from_utf8(response.stdout).unwrap()
}

#[marine]
pub fn http_pins(url: String, port: u32) -> String {
    let url = url_maker(url, port, "PINS".to_string(), None);
    let cmd = vec![url, "GET".to_string()];
    let response: MountedBinaryResult = curl_request(cmd);
    String::from_utf8(response.stdout).unwrap()
}

#[marine]
pub fn http_pin(url: String, port: u32, stream_id: String) -> String {
    let url = url_maker(url, port, "PINS".to_string(), Some(stream_id));
    let cmd = vec![url, "GET".to_string()];
    println!("cmd: {:?}", cmd);
    let response: MountedBinaryResult = curl_request(cmd);
    String::from_utf8(response.stdout).unwrap()
}

#[marine]
pub fn http_rm_pin(url: String, port: u32, stream_id: String) -> String {
    // not available in gateway mode: https://developers.ceramic.network/build/http/api/#remove-from-pinset
    let url = url_maker(url, port, "PINS".to_string(), Some(stream_id));
    let cmd = vec![url, "-X DELETE".to_string()];
    println!("cmd: {:?}", cmd);
    let response: MountedBinaryResult = curl_request(cmd);
    String::from_utf8(response.stdout).unwrap()
}

#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(cmd: Vec<String>) -> MountedBinaryResult;
}
