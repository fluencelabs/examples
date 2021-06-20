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

use marine_rs_sdk::module_manifest;
use marine_rs_sdk::{marine, WasmLoggerBuilder};
use serde_json;

module_manifest!();

fn main() {
    WasmLoggerBuilder::new().build().ok();
}

#[marine]
pub fn hex_to_int(data: String) -> u64 {
    if data.starts_with("0x") {
        let res = u64::from_str_radix(&data[2..], 16);
        if res.is_ok() {
            return res.unwrap();
        }
    }
    if data.contains("result") {
        let obj = serde_json::from_str::<serde_json::Value>(&data);
        let res = match obj {
            Ok(x) => {
                let res = x["result"].to_string();
                u64::from_str_radix(&res[2..], 16).unwrap()
            }
            Err(_) => 0u64,
        };
        return res;
    }

    0u64
}
