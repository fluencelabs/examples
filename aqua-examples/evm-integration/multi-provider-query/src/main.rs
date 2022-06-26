/*
 * Copyright 2022 Fluence Labs Limited
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

use marine_rs_sdk::{marine, module_manifest, MountedBinaryResult};
use serde::{Deserialize, Serialize};
use serde_json;
use std::sync::atomic::{AtomicUsize, Ordering};

pub static NONCE_COUNTER: AtomicUsize = AtomicUsize::new(1);

module_manifest!();

fn main() {}

fn get_nonce() -> u64 {
    NONCE_COUNTER.fetch_add(1, Ordering::SeqCst) as u64
}

#[marine]
pub struct ProviderInfo {
    pub url: String,
    pub name: String,
}

#[marine]
pub struct EVMResult {
    pub provider: String,
    pub stdout: String,
    pub stderr: String,
}

#[derive(Serialize, Deserialize)]
struct RpcData {
    jsonrpc: String,
    method: String,
    params: Vec<String>,
    id: u64,
}

#[derive(Serialize, Deserialize, Debug)]
struct RpcResponseError {
    code: i32,
    message: String,
}
#[derive(Serialize, Deserialize, Debug)]
struct RpcResponse {
    jsonrpc: String,
    error: Option<RpcResponseError>,
    result: Option<String>,
}

impl RpcData {
    fn new(method: String, params: Vec<String>) -> Self {
        let nonce = get_nonce();
        RpcData {
            jsonrpc: "2.0".to_owned(),
            method: method,
            params: params,
            id: nonce,
        }
    }
}

fn curl_cmd_builder(url: String, data: String) -> Vec<String> {
    let curl_cmd: Vec<String> = vec![
        url,
        "-X".to_string(),
        "POST".to_string(),
        "-H".to_string(),
        "Accept: application/json".to_string(),
        "-H".to_string(),
        "Content-Type: application/json".to_string(),
        "-d".to_string(),
        data,
    ];

    curl_cmd
}

fn get_curl_response(curl_cmd: Vec<String>) -> RpcResponse {
    let response = curl_request(curl_cmd);
    let response = String::from_utf8(response.stdout).unwrap();
    let response: Result<RpcResponse, _> = serde_json::from_str(&response);
    match response {
        Ok(r) => r,
        Err(e) => RpcResponse {
            jsonrpc: "".to_owned(),
            error: Some(RpcResponseError {
                code: -1,
                message: e.to_string(),
            }),
            result: None,
        },
    }
}

#[marine]
// see https://eth.wiki/json-rpc/API#eth_blocknumbers
fn get_block_number(provider: ProviderInfo) -> EVMResult {
    let method = "eth_blockNumber";
    let params: Vec<String> = vec![];
    let url = provider.url;

    let data = RpcData::new(method.to_owned(), params);
    let data = serde_json::to_string(&data).unwrap();

    let curl_cmd = curl_cmd_builder(url, data);
    let response = get_curl_response(curl_cmd);

    if response.error.is_none() {
        let raw_response = response.result.unwrap();
        let block_height = u64::from_str_radix(raw_response.trim_start_matches("0x"), 16);

        let result = match block_height {
            Ok(r) => {
                let j_res = serde_json::json!({ "block-height": r });
                EVMResult {
                    provider: provider.name,
                    stdout: j_res.to_string(),
                    stderr: "".to_owned(),
                }
            }
            Err(e) => {
                let err = format!("unable to convert {} to u64 with error {}", raw_response, e);
                EVMResult {
                    provider: provider.name,
                    stdout: "".to_owned(),
                    stderr: err,
                }
            }
        };
        return result;
    }

    EVMResult {
        provider: provider.name,
        stdout: "".to_owned(),
        stderr: serde_json::to_string(&response.error).unwrap(),
    }
}

#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(cmd: Vec<String>) -> MountedBinaryResult;
}
