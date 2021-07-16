use marine_rs_sdk::module_manifest;
use marine_rs_sdk::{marine, WasmLoggerBuilder};
use serde_json;

module_manifest!();

fn main() {
    WasmLoggerBuilder::new().build().ok();
}

#[marine]
pub fn extract_miner_address(json_string: String) -> String {
    let obj = serde_json::from_str::<serde_json::Value>(&json_string);
    match obj {
        Ok(x) => x["result"]["blockMiner"].to_string(),
        // Ok(x) => json_string,
        Err(_) => String::from("boo yah"),
    }
}
