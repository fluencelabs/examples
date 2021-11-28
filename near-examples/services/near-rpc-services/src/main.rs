/*
 * Copyright 2021 Fluence Labs Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

use marine_rs_sdk::{marine, module_manifest, MountedBinaryResult, WasmLoggerBuilder};

// mod utils;

module_manifest!();

pub fn main() {
    WasmLoggerBuilder::new().build().unwrap();
}

pub fn rpc_maker(url: String, method: String, params: String) -> Vec<String> {
    let data: String = format!(
        "-d {{\"jsonrpc\":\"2.0\", \"id\":\"dontcare\", \"method\":{}, \"params\":{} }}'",
        method, params
    );
    let curl_params = vec![
        "-X".to_string(),
        "POST".to_string(),
        url,
        data,
        "-H 'Content-Type: application/json'".to_string(),
    ];
    curl_params
}

pub fn url_maker(network_id: String) -> String {
    format!("https://rpc.{}.near.org", network_id)
}

#[marine]
pub fn tx_status(
    network_id: String,
    method: String,
    tx_id: String,
    account_id: String,
) -> MountedBinaryResult {
    // url -X POST https://rpc.testnet.near.org -d '{"id":"dontcare","method":"tx", "params":["6zgh2u9DqHHiXzdy9ouTP7oGky2T4nugqzqt9wJZwNFm", "boneyard93501.testnet"], "jsonrpc":"2.0"}' -H 'Content-Type: application/json
    let url = url_maker(network_id);
    let params = format!("[{}, {}]", tx_id, account_id);
    let curl_params: Vec<String> = rpc_maker(url, method, params);
    let response = curl_request(curl_params);
    response
}

#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(cmd: Vec<String>) -> MountedBinaryResult;
}

/*
#[cfg(test)]
mod tests {
    use marine_rs_sdk_test::marine_test;

    #[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts")]
    fn test_greeting(greeting: marine_test_env::greeting::ModuleInterface) {
        let name = "Marine";
        let res = greeting.greeting(name.to_string());
        assert_eq!(res, format!("Hi, {}", name));
    }
}
*/
