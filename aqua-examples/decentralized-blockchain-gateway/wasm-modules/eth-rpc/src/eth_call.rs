use marine_rs_sdk::marine;
use serde_json::Value;
use tokio::runtime::Builder;
use web3::Transport;

use crate::curl_transport::CurlTransport;
use crate::values::JsonString;

#[marine]
pub fn eth_call(uri: String, method: &str, json_args: Vec<String>) -> JsonString {
    let result: eyre::Result<Value> = try {
        let rt = Builder::new_current_thread().build()?;

        let args: Result<Vec<Value>, _> = json_args.into_iter().map(|a| serde_json::from_str(&a)).collect();
        let transport = CurlTransport::new(uri);
        let result = rt.block_on(transport.execute(method, args?))?;

        result
    };

    result.into()
}

