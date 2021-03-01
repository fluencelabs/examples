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

use crate::curl_request;
use fluence::fce;

#[fce]
pub fn get_latest_block(api_key: String) -> String {
    let url =
        f!("https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey={api_key}");

    let response: String = unsafe { curl_request(url) };
    response
}

#[fce]
pub fn get_block(api_key: String, block_number: u64) -> String {
    // let block_num = format!("{:X}", block_number);
    let url = f!("https://api.etherscan.io/api?module=block&action=getblockreward&blockno={block_number}&apikey={api_key}");

    let response: String = unsafe { curl_request(url) };
    response
}
