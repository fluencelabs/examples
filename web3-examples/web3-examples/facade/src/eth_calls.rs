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
use crate::eth_utils::{check_response_string, get_nonce, BLOCK_NUMBER_TAGS};
use crate::fce_results::JsonRpcResult;
use crate::jsonrpc_helpers::{batch, Request};
use chrono::Utc;
use marine_rs_sdk::marine;
use serde::{Deserialize, Deserializer, Serialize};
use serde_json;
use serde_json::Value;
use std::sync::atomic::{AtomicUsize, Ordering};

#[marine]
pub fn eth_get_balance(url: String, account: String, block_number: String) -> JsonRpcResult {
    let method = String::from("eth_getBalance");
    let id = get_nonce();

    let block_identifier: String;
    let number_test = block_number.parse::<u64>();
    if number_test.is_ok() {
        block_identifier = format!("0x{:x}", number_test.unwrap());
    } else if BLOCK_NUMBER_TAGS.contains(&block_number.as_str()) {
        block_identifier = String::from(block_number);
    } else {
        block_identifier = String::from("latest");
    }

    let params: Vec<String> = vec![account, block_identifier];
    let curl_args: String = Request::new(method, params, id).as_sys_string(&url);
    let response = curl_request(vec![curl_args]);
    let response = String::from_utf8(response.stdout).unwrap();
    check_response_string(response, &id)
}

#[marine]
pub fn eth_get_block_height(url: String) -> JsonRpcResult {
    let method = "eth_blockNumber".to_string();
    let params: Vec<String> = Vec::new();
    let id = get_nonce();

    let curl_args: String = Request::new(method, params, id).as_sys_string(&url);
    let response = curl_request(vec![curl_args]);
    let response = String::from_utf8(response.stdout).unwrap();
    check_response_string(response, &id)
}

#[marine]
pub fn eth_get_tx_by_hash(url: String, tx_hash: String) -> String {
    let method: String = String::from("eth_getTransactionByHash");
    let params: Vec<String> = vec![tx_hash];
    let id = get_nonce();

    let curl_args: String = Request::new(method, params, id).as_sys_string(&url);
    let response = curl_request(vec![curl_args]);
    let response = String::from_utf8(response.stdout).unwrap();
    response
}

#[derive(serde::Deserialize)]
pub struct TxSerde {
    // blockHash: DATA, 32 Bytes - hash of the block where this transaction was in. null when its pending.
    pub blockHash: Option<String>,
    // blockNumber: QUANTITY - block number where this transaction was in. null when its pending.
    pub blockNumber: Option<String>,
    // from: DATA, 20 Bytes - address of the sender.
    pub from: Option<String>,
    // gas: QUANTITY - gas provided by the sender.
    pub gas: Option<String>,
    // gasPrice: QUANTITY - gas price provided by the sender in Wei.
    pub gasPrice: Option<String>,
    // hash: DATA, 32 Bytes - hash of the transaction.
    pub hash: Option<String>,
    // input: DATA - the data send along with the transaction.
    pub input: Option<String>,
    // nonce: QUANTITY - the number of transactions made by the sender prior to this one.
    pub nonce: Option<String>,
    // to: DATA, 20 Bytes - address of the receiver. null when its a contract creation transaction.
    pub to: Option<String>,
    // transactionIndex: QUANTITY - integer of the transactions index position in the block. null when its pending.
    pub transactionIndex: Option<String>,
    // value: QUANTITY - value transferred in Wei.
    pub value: Option<String>,
}

fn null_to_default<'de, D, T>(d: D) -> Result<T, D::Error>
where
    D: Deserializer<'de>,
    T: Default + Deserialize<'de>,
{
    let opt = Option::deserialize(d)?;
    let val = opt.unwrap_or_else(T::default);
    Ok(val)
}

#[derive(serde::Deserialize)]
struct GetTxResponse {
    #[serde(deserialize_with = "null_to_default")]
    result: Option<TxSerde>,
}

#[marine]
pub struct Tx {
    pub blockHash: String,
    pub blockNumber: String,
    pub from: String,
    pub gas: String,
    pub gasPrice: String,
    pub hash: String,
    pub input: String,
    pub nonce: String,
    pub to: String,
    pub transactionIndex: String,
    pub value: String,
}

impl From<TxSerde> for Tx {
    fn from(ser: TxSerde) -> Self {
        Self {
            blockHash: ser.blockHash.unwrap_or_default(),
            blockNumber: ser.blockNumber.unwrap_or_default(),
            from: ser.from.unwrap_or_default(),
            gas: ser.gas.unwrap_or_default(),
            gasPrice: ser.gasPrice.unwrap_or_default(),
            hash: ser.hash.unwrap_or_default(),
            input: ser.input.unwrap_or_default(),
            nonce: ser.nonce.unwrap_or_default(),
            to: ser.to.unwrap_or_default(),
            transactionIndex: ser.transactionIndex.unwrap_or_default(),
            value: ser.value.unwrap_or_default(),
        }
    }
}

#[marine]
pub fn eth_get_txs_by_hashes(url: String, tx_hashes: Vec<String>) -> Vec<Tx> {
    let method: String = String::from("eth_getTransactionByHash");
    let params: Vec<_> = tx_hashes.into_iter().map(|h| vec![h]).collect();
    let requests = batch(url, method, params, get_nonce());
    match requests {
        Ok(requests) => requests
            .into_iter()
            .flat_map(|req| {
                let response = curl_request(vec![req]);
                let response = String::from_utf8(response.stdout).unwrap();
                let responses: Vec<GetTxResponse> = serde_json::from_str(response.as_str())
                    .unwrap_or_else(|err| {
                        log::error!("failed to deserialize batch response: {}", err);
                        panic!("failed to deserialize batch response: {}", err);
                    });
                responses.into_iter().flat_map(|r| Some(r.result?.into()))
            })
            .collect(),
        Err(err) => {
            log::error!("failed to create batch request: {}", err);
            vec![]
        }
    }
}
