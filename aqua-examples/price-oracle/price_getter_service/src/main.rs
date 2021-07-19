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
use picorand::{PicoRandGenerate, WyRand, RNG};

#[macro_use]
extern crate fstrings;

module_manifest!();

pub fn main() {
    WasmLoggerBuilder::new().build().unwrap();
}

#[marine]
pub struct Result {
    pub result: String,
    pub error_msg: String,
}

#[marine]
pub fn price_getter(coin: String, currency: String) -> Result {
    let url =
        f!("https://api.coingecko.com/api/v3/simple/price?ids={coin}&vs_currencies={currency}");
    let curl_cmd = vec![
        "-X".to_string(),
        "GET".to_string(),
        "-H".to_string(),
        "Accept: application/json".to_string(),
        url,
    ];
    let response = curl_request(curl_cmd);
    let result = String::from_utf8(response.stdout);
    /*
    let meta = marine_rs_sdk::get_call_parameters();
    let caller = meta.init_peer_id;

    let mut rng = RNG::<WyRand, u16>::new(name.as_str().as_bytes().to_hex());
    let multiplier = rng.generate_range(0x64, 0x3E8);
    */

    match result {
        Ok(res) => Result {
            result: res,
            error_msg: "".to_string(),
        },
        Err(_) => Result {
            result: "".to_string(),
            error_msg: String::from_utf8(response.stderr).unwrap(),
        },
    }
}

#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(cmd: Vec<String>) -> MountedBinaryResult;
}
