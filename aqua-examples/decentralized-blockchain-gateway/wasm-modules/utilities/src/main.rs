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

use marine_rs_sdk::{marine, module_manifest};
use serde_json;

module_manifest!();

fn main() {}

#[marine]
fn kv_to_u64(kv_string: String, k: String) -> u64 {
    let obj: serde_json::Value = serde_json::from_str(&kv_string).unwrap();
    obj[&k].as_u64().unwrap()
}
