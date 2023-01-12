#![feature(try_blocks)]

use marine_rs_sdk::module_manifest;
use marine_rs_sdk::{marine, MountedBinaryResult};
use tokio::runtime::Builder;
use web3::api::Eth;
use web3::helpers::CallFuture;
use web3::types::Address;
use web3::Web3;

use crate::curl_transport::{CurlTransport, FutResult};

pub mod curl_transport;
pub mod eth_call;
pub mod typed;
pub mod values;

module_manifest!();

pub fn main() {}

// #[tokio::main(flavor = "current_thread")]
// flavor idea comes from https://github.com/rjzak/tokio-echo-test/blob/main/src/main.rs#L42
// but seems to require additional tokio futures
pub fn get_accounts(uri: String) -> web3::error::Result<Vec<Vec<u8>>> {
    let rt = Builder::new_current_thread().build()?;

    let web3 = Web3::new(CurlTransport::new(uri));

    let eth = web3.eth();
    println!("Calling accounts.");
    let accounts: CallFuture<Vec<Address>, FutResult> = eth.accounts();
    let accounts: web3::Result<Vec<Address>> = rt.block_on(accounts);
    println!("Accounts: {:?}", accounts);

    Ok(accounts?
        .into_iter()
        .map(|a: Address| a.as_bytes().to_vec())
        .collect())
}

pub fn web3_call<Out: serde::de::DeserializeOwned, F: FnOnce(Eth<CurlTransport>) -> CallFuture<Out, FutResult>>(
    uri: String,
    call: F,
) -> web3::error::Result<Out> {
    let rt = Builder::new_current_thread()
        .build()
        .expect("error starting tokio runtime");

    let web3 = Web3::new(CurlTransport::new(uri));

    let result: CallFuture<Out, FutResult> = call(web3.eth());
    let result: web3::error::Result<Out> = rt.block_on(result);

    result
}

#[marine]
pub fn call_get_accounts() -> Vec<Vec<u8>> {
    get_accounts(String::new()).expect("error calling main")
}

#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(cmd: Vec<String>) -> MountedBinaryResult;
}

#[cfg(test)]
mod tests {
    use marine_rs_sdk_test::marine_test;
    use web3::types::Address;

    #[marine_test(
        config_path = "../tests_artifacts/Config.toml",
        modules_dir = "../tests_artifacts"
    )]
    fn get_accounts(rpc: marine_test_env::eth_rpc::ModuleInterface) {
        let accounts = rpc.call_get_accounts();
        // let addr: Address = "0x407d73d8a49eeb85d32cf465507dd71d507100c1"
        //     .parse()
        //     .unwrap();
        // assert_eq!(accounts, vec![addr.as_bytes().to_vec()]);
        assert_eq!(accounts.len(), 0);
    }
}
