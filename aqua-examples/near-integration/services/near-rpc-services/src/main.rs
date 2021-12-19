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
use serde;
use serde_json;

mod utils;
use utils::{rpc_maker, url_maker};

module_manifest!();

pub fn main() {
    WasmLoggerBuilder::new().build().unwrap();
}

#[marine]
pub struct Result {
    pub stderr: String,
    pub stdout: String,
}

#[marine]
pub fn tx_status(network_id: String, tx_id: String, account_id: String, receipt: bool) -> Result {
    let mut method = "tx".to_string();
    if receipt {
        method = "EXPERIMENTAL_tx_status".to_string();
    }
    let url = url_maker(network_id);
    let params = format!("[\"{}\", \"{}\"]", tx_id, account_id);
    let curl_params: Vec<String> = rpc_maker(url, method, params);
    let response = curl_request(curl_params);
    Result {
        stderr: response.error,
        stdout: String::from_utf8(response.stdout).unwrap(),
    }
}

#[marine]
pub fn gas_price(network_id: String, block_ref: String) -> Result {
    // block-ref can be block height or block hash
    let method = "gas_price".to_string();
    let url = url_maker(network_id);
    let params = format!("[\"{}\"]", block_ref);
    let curl_params: Vec<String> = rpc_maker(url, method, params);
    let response = curl_request(curl_params);
    Result {
        stderr: response.error,
        stdout: String::from_utf8(response.stdout).unwrap(),
    }
}

#[marine]
pub fn node_status(network_id: String) -> Result {
    // block-ref can be block height or block hash
    let method = "status".to_string();
    let url = url_maker(network_id);
    let params = "[]".to_string();
    let curl_params: Vec<String> = rpc_maker(url, method, params);
    let response = curl_request(curl_params);
    Result {
        stderr: response.error,
        stdout: String::from_utf8(response.stdout).unwrap(),
    }
}

#[marine]
pub fn view_account(network_id: String, account_id: String) -> Result {
    let method = "query".to_string();
    let url = url_maker(network_id);
    let params = format!(
        "{{\"request_type\": \"view_account\", \"finality\": \"final\",\"account_id\": \"{}\"}}",
        account_id
    );
    let curl_params: Vec<String> = rpc_maker(url, method, params);
    let response = curl_request(curl_params);
    Result {
        stderr: response.error,
        stdout: String::from_utf8(response.stdout).unwrap(),
    }
}
#[marine]
#[derive(Default)]
pub struct VAResult {
    pub stderr: String,
    pub stdout: VAResponse,
}
#[marine]
#[derive(Default, serde::Serialize, serde::Deserialize)]
pub struct VAResponse {
    pub amount: String,
    pub locked: String,
    pub code_hash: String,
    pub storage_usage: u64,
    pub storage_paid_at: u64,
    pub block_height: u64,
    pub block_hash: String,
}

impl VAResponse {
    pub fn new(
        amount: String,
        locked: String,
        code_hash: String,
        storage_usage: u64,
        storage_paid_at: u64,
        block_height: u64,
        block_hash: String,
    ) -> Self {
        VAResponse {
            amount,
            locked,
            code_hash,
            storage_usage,
            storage_paid_at,
            block_height,
            block_hash,
        }
    }

    pub fn from_obj(obj: &serde_json::Value) -> Self {
        VAResponse {
            amount: serde_json::ser::to_string(&obj["amount"]).unwrap(),
            locked: serde_json::ser::to_string(&obj["locked"]).unwrap(),
            code_hash: serde_json::ser::to_string(&obj["code_hash"]).unwrap(),
            storage_usage: obj["storage_usage"].as_u64().unwrap(),
            storage_paid_at: obj["storage_paid_at"].as_u64().unwrap(),
            block_height: obj["block_height"].as_u64().unwrap(),
            block_hash: serde_json::ser::to_string(&obj["block_hash"]).unwrap(),
        }
    }
}

#[marine]
pub fn view_account_structured(network_id: String, account_id: String) -> VAResult {
    let method = "query".to_string();
    let url = url_maker(network_id);
    let params = format!(
        "{{\"request_type\": \"view_account\", \"finality\": \"final\",\"account_id\": \"{}\"}}",
        account_id
    );
    let curl_params: Vec<String> = rpc_maker(url, method, params);
    let response = curl_request(curl_params);
    let stderr = response.error;
    let stdout = String::from_utf8(response.stdout).unwrap();

    if stderr.len() > 0 {
        return VAResult {
            stderr,
            stdout: VAResponse { ..<_>::default() },
        };
    }

    let response: serde_json::Result<serde_json::Value> = serde_json::from_str(&stdout);

    if response.is_err() {
        return VAResult {
            stderr: "unable to deserialize".to_string(),
            stdout: VAResponse { ..<_>::default() },
        };
    }

    let response: serde_json::Value = response.unwrap();

    if response["error"] != serde_json::Value::Null {
        return VAResult {
            stderr: stdout,
            stdout: VAResponse { ..<_>::default() },
        };
    };

    if response["result"] == serde_json::Value::Null {
        return VAResult {
            stderr: format!("Something went really wrong: {}", stdout),
            stdout: VAResponse { ..<_>::default() },
        };
    };
    let response = VAResponse::from_obj(&response["result"]);

    VAResult {
        stderr: "".to_string(),
        stdout: response,
    }
}

#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(cmd: Vec<String>) -> MountedBinaryResult;
}
