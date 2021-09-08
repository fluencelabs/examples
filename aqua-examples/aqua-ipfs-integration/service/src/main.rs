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

use marine_rs_sdk::{get_call_parameters, marine, module_manifest};
use rand::distributions::Alphanumeric;
use rand::Rng;
use std::path::{Path, PathBuf};

module_manifest!();

pub fn main() {}

#[marine]
pub struct SizeResult {
    pub size: u32,
    pub success: bool,
    pub error: String,
}

#[marine]
pub fn file_size(file_path: String) -> SizeResult {
    match std::fs::read(file_path) {
        Ok(bytes) => SizeResult {
            size: bytes.len() as _,
            success: true,
            error: String::new(),
        },
        Err(err) => SizeResult {
            size: 0,
            success: false,
            error: err.to_string(),
        },
    }
}

#[marine]
pub struct WriteResult {
    pub path: String,
    pub success: bool,
    pub error: String,
}

#[marine]
pub fn write_file_size(size: u32) -> WriteResult {
    let name: String = rand::thread_rng()
        .sample_iter(Alphanumeric)
        .take(16)
        .map(char::from)
        .collect();

    let file = vault_dir().join(&name);
    let file_str = file.to_string_lossy().to_string();
    match std::fs::write(&file, size.to_string()) {
        Ok(_) => WriteResult {
            path: file_str,
            success: true,
            error: String::new(),
        },
        Err(err) => WriteResult {
            path: String::new(),
            success: false,
            error: err.to_string(),
        },
    }
}

fn vault_dir() -> PathBuf {
    let particle_id = get_call_parameters().particle_id;
    let vault = Path::new("/tmp").join("vault").join(particle_id);

    vault
}
