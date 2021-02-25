/*
 * Copyright 2020 Fluence Labs Limited
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

#![allow(improper_ctypes)]

use fluence::fce;

use fluence::WasmLoggerBuilder;
use fluence::MountedBinaryResult as Result;
use fluence::MountedBinaryStringResult as StringResult;

/// Log level can be changed by `RUST_LOG` env as well.
pub fn main() {
    WasmLoggerBuilder::new().build().unwrap();
}

#[fce]
pub fn request(url: String) -> StringResult {
    unsafe { curl(vec![url]) }.stringify().unwrap()
}

#[fce]
pub fn download(url: String) -> Result {
    log::info!("download called with url {}", url);

    unsafe { curl(vec![url]) }
}


/// Permissions in `Config.toml` should exist to use host functions.
#[fce]
#[link(wasm_import_module = "host")]
extern "C" {
    fn curl(cmd: Vec<String>) -> Result;
}
