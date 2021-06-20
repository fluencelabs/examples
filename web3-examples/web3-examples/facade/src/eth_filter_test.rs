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
use serde_json;
use serde_json::Value;

#[marine]
fn test_filters(url: String) -> TestResult {
    let pending_filter_id = new_pending_tx_filter(url.clone());
    let result = get_filter_changes(url.clone(), pending_filter_id.clone());
    let result = uninstall_filter(url.clone(), pending_filter_id);

    if result {
        return TestResult::from(Result::from(Ok(String::from(String::from("")))));
    }
    let err_msg = format!("expected filter uninstall to be true but ot false");
    TestResult::from(Result::from(Err(String::from(err_msg))))
}

#[marine]
pub fn test_pending_with_null_filter(url: String) -> String {
    let mut matches: Vec<(String, String, String, String)> = Vec::new();
    let pending_filter_id = new_pending_tx_filter(url.clone());
    let result: String = get_filter_changes(url.clone(), pending_filter_id.clone());
    let results: serde_json::Value = serde_json::from_str(&result).unwrap();
    let results: Vec<String> = serde_json::from_value(results["result"].clone()).unwrap();
    for tx_hash in results.iter() {
        let tx: String = eth_get_tx_by_hash(url.clone(), tx_hash.clone());
        let tx: serde_json::Value = serde_json::from_str(&tx).unwrap();
        if tx["result"] != serde_json::Value::Null {
            println!("tx: {:?}", tx);
            let from_acct = serde_json::from_value(tx["result"]["from"].clone());
            let from_acct: String = if from_acct.is_ok() {
                from_acct.unwrap()
            } else {
                String::from("")
            };

            let to_acct = serde_json::from_value(tx["result"]["to"].clone());
            let to_acct: String = if to_acct.is_ok() {
                to_acct.unwrap()
            } else {
                String::from("")
            };

            let value = serde_json::from_value(tx["result"]["value"].clone());
            let value: String = if value.is_ok() {
                value.unwrap()
            } else {
                String::from("")
            };
            matches.push((tx_hash.clone(), from_acct, to_acct, value));
        }
    }
    uninstall_filter(url.clone(), pending_filter_id);
    serde_json::to_string(&matches).unwrap()
}
