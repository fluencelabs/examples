use fluence::{fce, WasmLoggerBuilder};
use serde_json;

fn main() {
    WasmLoggerBuilder::new().build().ok();
}


#[fce]
pub fn extract_miner_address(json_string: String) -> String {
    let obj = serde_json::from_str::<serde_json::Value>(&json_string);
    match obj {
       Ok(x) => x["result"]["blockMiner"].to_string(),
       // Ok(x) => json_string,
        Err(_) => String::from("boo yah"),
    }
}
