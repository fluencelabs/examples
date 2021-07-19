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

use marine_rs_sdk::{marine, module_manifest, MountedBinaryResult};
use picorand::{PicoRandGenerate, WyRand, RNG};
use serde_json;

#[macro_use]
extern crate fstrings;

module_manifest!();

pub fn main() {}

#[marine]
pub struct Result {
    pub result: f64,
    pub success: bool,
    pub error_msg: String,
}

#[marine]
pub fn price_getter(coin: String, currency: String, timestamp_ms: u64) -> Result {
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

    match result {
        Ok(res) => {
            let json_res = serde_json::from_str(&res.clone());
            if json_res.is_err() {
                return Result {
                    result: -1f64,
                    success: false,
                    error_msg: "Failure to complete call".to_string(),
                };
            }
            let json_res: serde_json::Value = json_res.unwrap();
            let value = json_res[coin.to_lowercase()][currency.to_lowercase()].as_f64();
            if value.is_none() {
                return Result {
                    result: -1f64,
                    success: false,
                    error_msg:
                        "No price value from source available. Check your coin and currency values."
                            .to_string(),
                };
            }

            let value: f64 = value.unwrap();

            let mut rng = RNG::<WyRand, u16>::new(timestamp_ms);
            let multiplier = rng.generate_range(5, 20) as f64;
            let rnd_value = value * (1f64 + multiplier / 100f64);
            Result {
                result: format!("{:.2}", rnd_value).parse::<f64>().unwrap(),
                success: true,
                error_msg: "".to_string(),
            }
        }
        Err(_) => Result {
            result: -1f64,
            success: false,
            error_msg: String::from_utf8(response.stderr).unwrap(),
        },
    }
}

#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(cmd: Vec<String>) -> MountedBinaryResult;
}
