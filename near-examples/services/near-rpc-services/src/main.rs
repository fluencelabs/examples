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
pub fn tx_status(
    network_id: String,
    method: String,
    tx_id: String,
    account_id: String,
) -> MountedBinaryResult {
    let url = url_maker(network_id);
    let params = format!("[\"{}\", \"{}\"]", tx_id, account_id);
    let curl_params: Vec<String> = rpc_maker(url, method, params);
    let response = curl_request(curl_params);
    println!("MountedBinaryResult: {:?}\n\n", response.clone());
    response
}

#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(cmd: Vec<String>) -> MountedBinaryResult;
}
