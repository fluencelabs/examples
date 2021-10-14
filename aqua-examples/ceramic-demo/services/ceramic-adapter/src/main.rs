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

module_manifest!();

pub mod ceramic_cli;
// pub mod ceramic_http;

pub fn main() {
    // WasmLoggerBuilder::new().build().ok();
}
/*
#[marine]
pub fn http_state(host: String, port: u32, payload: String) {
    let url = format!("https://{}:{}/state");
    let cmd = vec![url, "GET".to_string()];
    let response = curl_request(cmd);
}

#[marine]
pub fn http_show(url: String, stream_id: String) {}

#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(cmd: Vec<String>) -> MountedBinaryResult;
}
*/
