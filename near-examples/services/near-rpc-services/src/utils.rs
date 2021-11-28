
pub fn rpc_maker(url:String, method: String, params: String) -> Vec<String> {
    let data:String = format!("-d {{\"jsonrpc\":\"2.0\", \"id\":\"dontcare\", \"method\":{}, \"params\":{} }}'", method, params);
    let curl_params = vec![
        "-X".to_string(),
        "POST".to_string(),
        url,
        data,
        "-H 'Content-Type: application/json'".to_string()
    ]
    curl_params
} 