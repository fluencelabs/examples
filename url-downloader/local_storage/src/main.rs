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

use marine_rs_sdk::marine;
use marine_rs_sdk::module_manifest;
use marine_rs_sdk::WasmLoggerBuilder;

use std::fs;
use std::path::PathBuf;

module_manifest!();

const SITES_DIR: &str = "/sites/";

/// Log level can be changed by `RUST_LOG` env as well.
pub fn main() {
    WasmLoggerBuilder::new().build().unwrap();
}

/// You can read or write files from the file system if there is permission to use directories described in `Config.toml`.
#[marine]
pub fn put(name: String, file_content: Vec<u8>) -> String {
    log::info!("put called with file name {}\n", name);
    let rpc_tmp_filepath = format!("{}{}", SITES_DIR, name);

    let result = fs::write(PathBuf::from(rpc_tmp_filepath.clone()), file_content);
    if let Err(e) = result {
        return format!("file can't be written: {}", e);
    }

    String::from("Ok")
}

#[marine]
pub fn get(file_name: String) -> Vec<u8> {
    log::info!("get called with file name: {}\n", file_name);

    let tmp_filepath = format!("{}{}", SITES_DIR, file_name);

    fs::read(tmp_filepath).unwrap_or_else(|_| b"error while reading file".to_vec())
}
