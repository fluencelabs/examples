use jsonrpc_core::types::request::Call;
use marine_rs_sdk::marine;
use serde_json::Value;
use tokio::runtime::Builder;
use web3::futures::future::BoxFuture;
use web3::helpers::CallFuture;
use web3::types::Address;
use web3::{RequestId, Transport};

#[derive(Debug, Clone)]
struct Dummy;

type FutResult = BoxFuture<'static, web3::error::Result<Value>>;

impl Transport for Dummy {
    type Out = FutResult;

    fn prepare(&self, _: &str, _: Vec<Value>) -> (RequestId, Call) {
        todo!()
    }

    fn send(&self, _: RequestId, _: Call) -> Self::Out {
        Box::pin(async { Ok(Value::Null) })
    }
}

// #[tokio::main(flavor = "current_thread")]
// flavor idea comes from https://github.com/rjzak/tokio-echo-test/blob/main/src/main.rs#L42
// but seems to require additional tokio futures
pub fn main() -> web3::error::Result<()> {
    // let rt = Runtime::new().unwrap();

    let rt = Builder::new_current_thread().build().unwrap();

    let web3 = web3::Web3::new(Dummy);

    let eth = web3.eth();
    println!("Calling accounts.");
    let accounts: CallFuture<Vec<Address>, FutResult> = eth.accounts();
    let accounts: web3::Result<Vec<Address>> = rt.block_on(accounts);
    let mut accounts = accounts?;
    println!("Accounts: {:?}", accounts);
    accounts.push("00a329c0648769a73afac7f9381e08fb43dbea72".parse().unwrap());

    println!("Calling balance.");
    for account in accounts {
        let balance = rt.block_on(web3.eth().balance(account, None))?;
        println!("Balance of {:?}: {}", account, balance);
    }

    Ok(())
}

#[marine]
pub fn call_dummy() {
    main().unwrap()
}

#[cfg(test)]
mod tests {
    use marine_rs_sdk_test::marine_test;

    #[marine_test(
        config_path = "../tests_artifacts/Config.toml",
        modules_dir = "../tests_artifacts"
    )]
    fn dummy(rpc: marine_test_env::eth_rpc::ModuleInterface) {
        rpc.call_dummy();
    }
}
