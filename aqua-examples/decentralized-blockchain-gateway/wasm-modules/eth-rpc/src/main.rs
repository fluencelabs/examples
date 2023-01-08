use jsonrpc_core::types::request::Call;
use serde_json::json;
use serde_json::Value;
use tokio::runtime::Builder;
use web3::{RequestId, Transport};
use web3::futures::future::BoxFuture;
use web3::helpers::CallFuture;
use web3::types::Address;

use marine_rs_sdk::marine;
use marine_rs_sdk::MountedBinaryResult;
use marine_rs_sdk::module_manifest;

module_manifest!();

#[derive(Debug, Clone)]
struct Dummy;

type FutResult = BoxFuture<'static, web3::error::Result<Value>>;

impl Transport for Dummy {
    type Out = FutResult;

    fn prepare(&self, method: &str, params: Vec<Value>) -> (RequestId, Call) {
        let request = web3::helpers::build_request(1, method, params.clone());
        (1, request)
    }

    fn send(&self, _: RequestId, _: Call) -> Self::Out {
        Box::pin(async { Ok(json!(["0x407d73d8a49eeb85d32cf465507dd71d507100c1"])) })
    }
}

pub fn main() {}

// #[tokio::main(flavor = "current_thread")]
// flavor idea comes from https://github.com/rjzak/tokio-echo-test/blob/main/src/main.rs#L42
// but seems to require additional tokio futures
pub fn get_accounts() -> web3::error::Result<Vec<Vec<u8>>> {
    let rt = Builder::new_current_thread().build()?;

    let web3 = web3::Web3::new(Dummy);

    let eth = web3.eth();
    println!("Calling accounts.");
    let accounts: CallFuture<Vec<Address>, FutResult> = eth.accounts();
    let accounts: web3::Result<Vec<Address>> = rt.block_on(accounts);
    println!("Accounts: {:?}", accounts);

    Ok(accounts?.into_iter().map(|a: Address| a.as_bytes().to_vec()).collect())
}

#[marine]
pub fn call_get_accounts() -> Vec<Vec<u8>> {
    get_accounts().expect("error calling main")
}

#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(cmd: Vec<String>) -> MountedBinaryResult;
}


#[cfg(test)]
mod tests {
    use web3::types::Address;

    use marine_rs_sdk_test::marine_test;

    #[marine_test(
        config_path = "../tests_artifacts/Config.toml",
        modules_dir = "../tests_artifacts"
    )]
    fn get_accounts(rpc: marine_test_env::eth_rpc::ModuleInterface) {
        let accounts = rpc.call_get_accounts();
        let addr: Address = "0x407d73d8a49eeb85d32cf465507dd71d507100c1".parse().unwrap();
        assert_eq!(accounts, vec![addr.as_bytes().to_vec()]);
    }
}
