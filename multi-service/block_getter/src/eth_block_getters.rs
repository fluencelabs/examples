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

use crate::curl_request;
use marine_rs_sdk::marine;
use marine_rs_sdk::MountedBinaryResult;

fn result_to_string(result: MountedBinaryResult) -> String {
    if result.is_success() {
        return String::from_utf8(result.stdout).expect("Found invalid UTF-8");
    }
    String::from_utf8(result.stderr).expect("Found invalid UTF-8")
}

#[marine]
pub fn get_latest_block(api_key: String) -> String {
    let url =
        f!("https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey={api_key}");
    let header = "-d \"\"";

    let curl_cmd: Vec<String> = vec![header.into(), url.into()];
    let response = curl_request(curl_cmd);
    let res = result_to_string(response);
    let obj = serde_json::from_str::<serde_json::Value>(&res).unwrap();
    serde_json::from_value(obj["result"].clone()).unwrap()
}

#[marine]
pub fn get_block(api_key: String, block_number: u32) -> String {
    let url = f!("https://api.etherscan.io/api?module=block&action=getblockreward&blockno={block_number}&apikey={api_key}");
    let header = "-d \"\"";

    let curl_cmd: Vec<String> = vec![header.into(), url];
    let response = curl_request(curl_cmd);
    result_to_string(response)
}
