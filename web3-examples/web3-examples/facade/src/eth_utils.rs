use crate::fce_results::JsonRpcResult;
use std::sync::atomic::{AtomicUsize, Ordering};

pub const BLOCK_NUMBER_TAGS: [&'static str; 3] = ["latest", "earliest", "pending"];
pub static NONCE_COUNTER: AtomicUsize = AtomicUsize::new(1);

pub fn get_nonce() -> u64 {
    NONCE_COUNTER.fetch_add(1, Ordering::SeqCst) as u64
}

pub fn check_response_string(response: String, id: &u64) -> JsonRpcResult {
    if response.len() == 0 {
        let err_msg = "{\"jsonrpc\":\"$V\",\"id\":$ID,\"error\":{\"code\":-32700,\"message\":Curl connection failed}}";
        let err_msg = err_msg.replace("$ID", &id.to_string());
        return JsonRpcResult::from(Result::from(Err(err_msg)));
    }

    match response.contains("error") {
        true => JsonRpcResult::from(Result::from(Err(response))),
        false => JsonRpcResult::from(Result::from(Ok(response))),
    }
}

pub fn wei_to_eth(amount: &u128) -> f64 {
    *amount as f64 / (1_000_000_000.0 * 1_000_000_000.0)
}
