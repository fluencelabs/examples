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

pub const JSON_RPC: &'static str = "2.0";

#[derive(Debug)]
pub struct Request {
    pub jsonrpc: String,
    pub method: String,
    pub params: Vec<String>,
    pub id: u64,
}

impl Request {
    pub fn new(method: String, params: Vec<String>, id: u64) -> Self {
        Request {
            jsonrpc: String::from(JSON_RPC),
            method,
            params,
            id,
        }
    }

    pub fn as_sys_string(&self, url: &String) -> String {
        let result = format!("-s -X POST --data '{{\"jsonrpc\":\"{}\", \"method\": \"{}\", \"params\":{:?}, \"id\":{}}}' {}", self.jsonrpc, self.method, self.params, self.id, url);
        result
    }
}

/*
[
    {
        "jsonrpc": "2.0",
        "method": "eth_getTransactionByHash",
        "params": [
            "0xdb3fbed87cc7834981610df7e5827c09b9d2496bb5a6ae604bf7c603a6f79d80"
        ],
        "id": 766
    },
    {
        "jsonrpc": "2.0",
        "method": "eth_getTransactionByHash",
        "params": [
            "0x8bc16f653235d2130e5fd05659c290dcba2095681e9e3d04805c92f38914b6ce"
        ],
        "id": 767
    }
]
 */
pub fn batch(url: String, method: String, params: Vec<Vec<String>>, id_start: u64) -> serde_json::Result<Vec<String>> {
    use serde_json::json;

    params.chunks(50).map(|params| {
        let mut id = id_start;
        let requests: Vec<_> = params.into_iter().map(|params| {
            let value = json!({
            "jsonrpc": "2.0",
            "method": method,
            "params": params,
            "id": id
        });
            id += 1;
            value
        }).collect();

        let requests = serde_json::to_string(&requests)?;
        let curl_args = format!(r#"-s -X POST --data '{}' {}"#, requests, url);

        Ok(curl_args)
    }).collect()
}
