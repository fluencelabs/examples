#![allow(unused)]

use marine_rs_sdk::marine;
use web3::types::*;

/// Get list of available accounts.
// #[marine]
pub fn accounts() -> Vec<Address> {
    todo!()
}

/// Get current block number
// #[marine]
pub fn block_number() -> U64 {
    todo!()
}

/// Call a constant method of contract without changing the state of the blockchain.
// #[marine]
pub fn call(req: CallRequest, block: Option<BlockId>) -> Bytes {
    todo!()
}

/// Get coinbase address
// #[marine]
pub fn coinbase() -> Address {
    todo!()
}

/// Compile LLL
// #[marine]
pub fn compile_lll(code: String) -> Bytes {
    todo!()
}

/// Compile Solidity
// #[marine]
pub fn compile_solidity(code: String) -> Bytes {
    todo!()
}

/// Compile Serpent
// #[marine]
pub fn compile_serpent(code: String) -> Bytes {
    todo!()
}

/// Call a contract without changing the state of the blockchain to estimate gas usage.
// #[marine]
pub fn estimate_gas(req: CallRequest, block: Option<BlockNumber>) -> U256 {
    todo!()
}

/// Get current recommended gas price
// #[marine]
pub fn gas_price() -> U256 {
    todo!()
}

/// Returns a collection of historical gas information. This can be used for evaluating the max_fee_per_gas
/// and max_priority_fee_per_gas to send the future transactions.
// #[marine]
pub fn fee_history(
    block_count: U256,
    newest_block: BlockNumber,
    reward_percentiles: Option<Vec<f64>>,
) -> FeeHistory {
    todo!()
}

/// Get balance of given address
// #[marine]
pub fn balance(address: Address, block: Option<BlockNumber>) -> U256 {
    todo!()

}

/// Get all logs matching a given filter object
// #[marine]
pub fn logs(filter: Filter) -> Vec<Log> {
    todo!()
}

/// Get block details with transaction hashes.
// #[marine]
pub fn block(block: BlockId) -> Option<Block<H256>> {
    todo!()


}

/// Get block details with full transaction objects.
// #[marine]
pub fn block_with_txs(block: BlockId) -> Option<Block<Transaction>> {
    todo!()


}

/// Get number of transactions in block
// #[marine]
pub fn block_transaction_count(block: BlockId) -> Option<U256> {
    todo!()
}

/// Get code under given address
// #[marine]
pub fn code(address: Address, block: Option<BlockNumber>) -> Bytes {
    todo!()

}

/// Get supported compilers
// #[marine]
pub fn compilers() -> Vec<String> {
    todo!()
}

/// Get chain id
// #[marine]
pub fn chain_id() -> U256 {
    todo!()
}

/// Get available user accounts. This method is only available in the browser. With MetaMask,
/// this will cause the popup that prompts the user to allow or deny access to their accounts
/// to your app.
// #[marine]
pub fn request_accounts() -> Vec<Address> {
    todo!()
}

/// Get storage entry
// #[marine]
pub fn storage(address: Address, idx: U256, block: Option<BlockNumber>) -> H256 {
    todo!()
}

/// Get nonce
// #[marine]
pub fn transaction_count(address: Address, block: Option<BlockNumber>) -> U256 {
    todo!()
}

/// Get transaction
// #[marine]
pub fn transaction(id: TransactionId) -> Option<Transaction> {
    todo!()
}

/// Get transaction receipt
// #[marine]
pub fn transaction_receipt(hash: H256) -> Option<TransactionReceipt> {
    todo!()

}

/// Get uncle header by block ID and uncle index.
///
/// This method is meant for TurboGeth compatiblity,
/// which is missing transaction hashes in the response.
// #[marine]
pub fn uncle_header(block: BlockId, index: Index) -> Option<BlockHeader> {
    todo!()
}

/// Get uncle by block ID and uncle index -- transactions only has hashes.
// #[marine]
pub fn uncle(block: BlockId, index: Index) -> Option<Block<H256>> {
    todo!()
}

fn fetch_uncle<X>(block: BlockId, index: Index) -> Option<X> {
    todo!()
}

/// Get uncle count in block
// #[marine]
pub fn uncle_count(block: BlockId) -> Option<U256> {
    todo!()
}

/// Get work package
// #[marine]
pub fn work() -> Work {
    todo!()
}

/// Get hash rate
// #[marine]
pub fn hashrate() -> U256 {
    todo!()
}

/// Get mining status
// #[marine]
pub fn mining() -> bool {
    todo!()
}

/// Start new block filter
// #[marine]
pub fn new_block_filter() -> U256 {
    todo!()
}

/// Start new pending transaction filter
// #[marine]
pub fn new_pending_transaction_filter() -> U256 {
    todo!()
}

/// Start new pending transaction filter
// #[marine]
pub fn protocol_version() -> String {
    todo!()
}

/// Sends a rlp-encoded signed transaction
// #[marine]
pub fn send_raw_transaction(rlp: Bytes) -> H256 {
    todo!()
}

/// Sends a transaction transaction
// #[marine]
pub fn send_transaction(tx: TransactionRequest) -> H256 {
    todo!()
}

/// Signs a hash of given data
// #[marine]
pub fn sign(address: Address, data: Bytes) -> H520 {
    todo!()
}

/// Submit hashrate of external miner
// #[marine]
pub fn submit_hashrate(rate: U256, id: H256) -> bool {
    todo!()
}

/// Submit work of external miner
// #[marine]
pub fn submit_work(nonce: H64, pow_hash: H256, mix_hash: H256) -> bool {
    todo!()
}

/// Get syncing status
// #[marine]
pub fn syncing() -> SyncState {
    todo!()
}

/// Returns the account- and storage-values of the specified account including the Merkle-proof.
// #[marine]
pub fn proof(
    address: Address,
    keys: Vec<U256>,
    block: Option<BlockNumber>,
) -> Option<Proof> {
    todo!()
}
