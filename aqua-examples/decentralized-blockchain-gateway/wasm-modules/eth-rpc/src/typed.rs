#![allow(unused)]

use marine_rs_sdk::marine;
use web3::types::{BlockId, BlockNumber, Bytes, CallRequest};

use crate::values::{BytesValue, JsonString, U64Value};
use crate::web3_call;

/// Get list of available accounts.
#[marine]
pub fn accounts(uri: String) -> Vec<JsonString> {
    web3_call(uri, |w| w.accounts())
        .into_iter()
        .map(|a| {
            let json = serde_json::to_value(&a).map_err(eyre::Report::from);
            JsonString::from(json)
        })
        .collect()
}

/// Get current block number
#[marine]
pub fn block_number(uri: String) -> U64Value {
    web3_call(uri, |w| w.block_number()).into()
}

/// Call a constant method of contract without changing the state of the blockchain.
#[marine]
pub fn call(uri: String, req: String, block: u64) -> BytesValue {
    let result: eyre::Result<Bytes> = try {
        let req: CallRequest = serde_json::from_str(&req)?;
        web3_call(uri, move |w| {
            w.call(
                req,
                Some(BlockId::Number(BlockNumber::Number(block.into()))),
            )
        })?
    };

    result.into()
}

/// Get coinbase address
// #[marine]
pub fn coinbase(uri: String) -> String {
    todo!()
}

/// Compile LLL
// #[marine]
pub fn compile_lll(uri: String, code: String) -> Vec<u8> {
    todo!()
}

/// Compile Solidity
// #[marine]
pub fn compile_solidity(uri: String, code: String) -> Vec<u8> {
    todo!()
}

/// Compile Serpent
// #[marine]
pub fn compile_serpent(uri: String, code: String) -> Vec<u8> {
    todo!()
}

/// Call a contract without changing the state of the blockchain to estimate gas usage.
// #[marine]
pub fn estimate_gas(uri: String, req: String, block: String) -> String {
    todo!()
}

/// Get current recommended gas price
// #[marine]
pub fn gas_price(uri: String) -> String {
    todo!()
}

/// Returns a collection of historical gas information. This can be used for evaluating the max_fee_per_gas
/// and max_priority_fee_per_gas to send the future transactions.
// #[marine]
pub fn fee_history(
    uri: String,
    block_count: String,
    newest_block: String,
    reward_percentiles: Vec<f64>,
) -> String {
    todo!()
}

/// Get balance of given address
// #[marine]
pub fn balance(uri: String, address: String, block: String) -> String {
    todo!()
}

/// Get all logs matching a given filter object
// #[marine]
pub fn logs(uri: String, filter: String) -> Vec<String> {
    todo!()
}

/// Get block details with transaction hashes.
// #[marine]
pub fn block(uri: String, block: String) -> String {
    todo!()
}

/// Get block details with full transaction objects.
// #[marine]
pub fn block_with_txs(uri: String, block: String) -> String {
    todo!()
}

/// Get number of transactions in block
// #[marine]
pub fn block_transaction_count(uri: String, block: String) -> String {
    todo!()
}

/// Get code under given address
// #[marine]
pub fn code(uri: String, address: String, block: String) -> Vec<u8> {
    todo!()
}

/// Get supported compilers
// #[marine]
pub fn compilers(uri: String) -> Vec<String> {
    todo!()
}

/// Get chain id
// #[marine]
pub fn chain_id(uri: String) -> String {
    todo!()
}

/// Get available user accounts. This method is only available in the browser. With MetaMask,
/// this will cause the popup that prompts the user to allow or deny access to their accounts
/// to your app.
// #[marine]
pub fn request_accounts(uri: String) -> Vec<String> {
    todo!()
}

/// Get storage entry
// #[marine]
pub fn storage(uri: String, address: String, idx: String, block: String) -> String {
    todo!()
}

/// Get nonce
// #[marine]
pub fn transaction_count(uri: String, address: String, block: String) -> String {
    todo!()
}

/// Get transaction
// #[marine]
pub fn transaction(uri: String, id: String) -> String {
    todo!()
}

/// Get transaction receipt
// #[marine]
pub fn transaction_receipt(uri: String, hash: String) -> String {
    todo!()
}

/// Get uncle header by block ID and uncle index.
///
/// This method is meant for TurboGeth compatiblity,
/// which is missing transaction hashes in the response.
// #[marine]
pub fn uncle_header(uri: String, block: String, index: String) -> String {
    todo!()
}

/// Get uncle by block ID and uncle index -- transactions only has hashes.
// #[marine]
pub fn uncle(uri: String, block: String, index: String) -> String {
    todo!()
}

/// Get uncle count in block
// #[marine]
pub fn uncle_count(uri: String, block: String) -> String {
    todo!()
}

/// Get work package
// #[marine]
pub fn work(uri: String) -> String {
    todo!()
}

/// Get hash rate
// #[marine]
pub fn hashrate(uri: String) -> String {
    todo!()
}

/// Get mining status
// #[marine]
pub fn mining(uri: String) -> bool {
    todo!()
}

/// Start new block filter
// #[marine]
pub fn new_block_filter(uri: String) -> String {
    todo!()
}

/// Start new pending transaction filter
// #[marine]
pub fn new_pending_transaction_filter(uri: String) -> String {
    todo!()
}

/// Start new pending transaction filter
// #[marine]
pub fn protocol_version(uri: String) -> String {
    todo!()
}

/// Sends a rlp-encoded signed transaction
// #[marine]
pub fn send_raw_transaction(uri: String, rlp: String) -> String {
    todo!()
}

/// Sends a transaction transaction
// #[marine]
pub fn send_transaction(uri: String, tx: String) -> String {
    todo!()
}

/// Signs a hash of given data
// #[marine]
pub fn sign(uri: String, address: String, data: String) -> String {
    todo!()
}

/// Submit hashrate of external miner
// #[marine]
pub fn submit_hashrate(uri: String, rate: String, id: String) -> bool {
    todo!()
}

/// Submit work of external miner
// #[marine]
pub fn submit_work(uri: String, nonce: String, pow_hash: String, mix_hash: String) -> bool {
    todo!()
}

/// Get syncing status
// #[marine]
pub fn syncing(uri: String) -> String {
    todo!()
}

/// Returns the account- and storage-values of the specified account including the Merkle-proof.
// #[marine]
pub fn proof(uri: String, address: String, keys: String, block: String) -> String {
    todo!()
}
