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

use crate::eth_calls::{eth_get_balance, eth_get_tx_by_hash};
use crate::eth_filters::{get_filter_changes, new_pending_tx_filter, uninstall_filter};
use crate::eth_utils::wei_to_eth;
use crate::fce_results::TestResult;
use marine_rs_sdk::marine;

#[marine]
fn test_eth_get_balance_good(url: String) -> TestResult {
    let burn_address = String::from("0x0000000000000000000000000000000000000000");
    let block_height = String::from("latest");
    // burn account balances, min, per 1/27/21:
    // https://etherscan.io/address/0x0000000000000000000000000000000000000000; 8412.0
    // https://kovan.etherscan.io/address/0x0000000000000000000000000000000000000000; 213.0
    // https://rinkeby.etherscan.io/address/0x0000000000000000000000000000000000000000; 1566.0
    // https://goerli.etherscan.io/address/0x0000000000000000000000000000000000000000; 1195.0

    let result = eth_get_balance(url, burn_address, block_height);
    let hex_balance: String = result.result;
    let wei_balance: u128 = u128::from_str_radix(&hex_balance[2..], 16).unwrap();
    let eth_balance: f64 = wei_to_eth(&wei_balance);
    if eth_balance > 213.0 {
        return TestResult::from(Result::from(Ok(String::from(""))));
    }
    let err_msg = format!("expected: gt {}, actual {:.2}", 213.0, eth_balance);
    TestResult::from(Result::from(Err(err_msg)))
}

#[marine]
fn test_eth_get_balance_bad(url: String) -> TestResult {
    let burn_address = String::from("0x0000000000000000000000000000000000000000");
    let block_height = String::from("latest");
    // burn account balances, min, per 1/27/21:
    // https://etherscan.io/address/0x0000000000000000000000000000000000000000; 8412.0
    // https://kovan.etherscan.io/address/0x0000000000000000000000000000000000000000; 213.0
    // https://rinkeby.etherscan.io/address/0x0000000000000000000000000000000000000000; 1566.0
    // https://goerli.etherscan.io/address/0x0000000000000000000000000000000000000000; 1195.0

    let result = eth_get_balance(url, burn_address, block_height);
    let hex_balance: String = result.result;
    let wei_balance: u128 = u128::from_str_radix(&hex_balance[2..], 16).unwrap();
    let eth_balance: f64 = wei_to_eth(&wei_balance);
    if eth_balance > 1_000_000.0 {
        return TestResult::from(Result::from(Ok(String::from(""))));
    }
    let err_msg = format!("expected: gt {}, actual {:.2}", 1_000_000, eth_balance);
    TestResult::from(Result::from(Err(err_msg)))
}

#[marine]
fn test_eth_get_tx_by_hash(url: String, tx_hash: String) {
    let res: String = eth_get_tx_by_hash(url, tx_hash.clone());
    let obj: serde_json::Value = serde_json::from_str(&res).unwrap();
    println!(
        "expected: {} == {} actual : {}",
        tx_hash,
        obj["result"]["hash"],
        tx_hash == obj["result"]["hash"]
    );
}
