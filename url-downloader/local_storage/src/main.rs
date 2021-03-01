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

use std::fs;
use fluence::fce;
use fluence::WasmLoggerBuilder;
use std::path::Path;

const SITES_DIR: &str = "/sites/";

/// Log level can be changed by `RUST_LOG` env as well.
pub fn main() {
    WasmLoggerBuilder::new().build().unwrap();
}

/// You can read or write files from the file system if there is permission to use directories described in `Config.toml`.
#[fce]
pub fn put(file_name: String, file_content: Vec<u8>) -> String {
    log::info!("put called with file name {}", file_name);

    let path = Path::new(SITES_DIR).join(file_name);

    let result = fs::write(&path, file_content);
    if let Err(e) = result {
        return format!("file {} can't be written: {}", path.to_string_lossy(), e);
    }

    String::from("Ok")
}

#[fce]
pub fn get(file_name: String) -> Vec<u8> {
    log::info!("get called with file name: {}", file_name);

    let path = Path::new(SITES_DIR).join(file_name);

    fs::read(&path).unwrap_or_else(|err| format!("error while reading file {}: {}", path.to_string_lossy(), err).into_bytes())
}
