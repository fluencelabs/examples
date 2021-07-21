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

use marine_rs_sdk::{marine, module_manifest};

module_manifest!();

pub fn main() { }

#[marine]
pub struct SizeResult {
    pub size: u32,
    pub success: bool,
    pub error: String,
}

#[marine]
pub fn file_size(file_path: String) -> SizeResult {
    match std::fs::read(file_path) {
        Ok(bytes) => SizeResult { size: bytes.len() as _, success: true, error: String::new() },
        Err(err) => SizeResult { size: 0, success: false, error: err.to_string() },
    }
}

