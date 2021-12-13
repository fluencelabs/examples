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

fn make_rpc(network_id:String, method:String) => Vec<String> {
    let url = format!("https://rpc.{}.near.org", network_id);
    let json_rpc = format!("\"jsonrpc\":\"2.0\", \"id\':\"dontcare\", \"method\":\"{}\", method), 
    let curl_params = vec!["-X".to_string(), "POST".to_string(), json_rpc];
    curl_params
}

pub fn deploy(account_id: String, private_key:String, CID:String) => String {

}

#[marine]

