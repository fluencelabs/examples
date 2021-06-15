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
#![allow(
    non_snake_case,
    unused_variables,
    unused_imports,
    unused_parens,
    unused_mut
)]

#[macro_use]
extern crate fstrings;

use marine_rs_sdk::marine;
use marine_rs_sdk::module_manifest;
use marine_rs_sdk::MountedBinaryResult;
use marine_rs_sdk::WasmLoggerBuilder;

mod eth_price_getter;

module_manifest!();

#[allow(dead_code)]
pub(crate) type Result<T> = std::result::Result<T, T>;

pub fn main() {
    WasmLoggerBuilder::new().build().ok();
}

#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(url: Vec<String>) -> MountedBinaryResult;
}
