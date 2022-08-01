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

use marine_rs_sdk::{marine, module_manifest, MountedBinaryResult};
use serde::{Deserialize, Serialize};
use serde_json;

module_manifest!();

fn main() {}

#[marine]
pub struct ProviderInfo {
    pub url: String,
}

#[marine]
pub struct IpfsResult {
    pub stdout: String,
    pub stderr: String,
}

#[marine]
#[derive(Deserialize, Serialize, Debug)]
pub struct FuncAddr {
    peer_id: String,
    service_id: String,
}

impl FuncAddr {
    pub fn new(peer_id: &str, service_id: &str) -> Self {
        FuncAddr {
            peer_id: peer_id.to_string(),
            service_id: service_id.to_string(),
        }
    }
}

#[marine]
pub fn params_from_cid(multiaddr: String, cid: String) -> Vec<FuncAddr> {
    let ipfs_cmd = vec!["--api".to_string(), multiaddr, "cat".to_string(), cid];

    let ipfs_response = ipfs_request(ipfs_cmd);
    let stdout = String::from_utf8(ipfs_response.stdout).unwrap();
    let stderr = String::from_utf8(ipfs_response.stderr).unwrap();

    if stderr.len() > 0 {
        return vec![FuncAddr::new("", "")];
    }
    match serde_json::from_str(&stdout) {
        Ok(r) => r,
        Err(e) => {
            println!("err: {}", e);
            vec![FuncAddr::new("", "")]
        }
    }
}

#[marine]
#[link(wasm_import_module = "ipfs_adapter")]
extern "C" {
    pub fn ipfs_request(cmd: Vec<String>) -> MountedBinaryResult;
}
