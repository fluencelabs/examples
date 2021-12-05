pub const JSON_RPC: &'static str = "2.0";
pub const NONCE: &'static str = "dontcare";

pub fn rpc_maker(url: String, method: String, params: String) -> Vec<String> {
    let data: String = format!(
        "-d {{\"jsonrpc\":\"{}\", \"id\":\"{}\", \"method\":\"{}\", \"params\":{} }}",
        JSON_RPC, NONCE, method, params
    );
    let curl_params = vec![
        "-X".to_string(),
        "POST".to_string(),
        url,
        data,
        "-H".to_string(),
        "Content-Type: application/json".to_string(),
    ];
    curl_params
}

pub fn url_maker(network_id: String) -> String {
    format!("https://rpc.{}.near.org", network_id)
}
