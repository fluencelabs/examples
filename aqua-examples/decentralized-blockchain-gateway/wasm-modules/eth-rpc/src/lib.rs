use async_std::task;
use web3::{RequestId, Transport};
use web3::futures::future::BoxFuture;
use web3::helpers::CallFuture;
use web3::types::Address;
use serde_json::Value;
use jsonrpc_core::types::request::Call;

#[derive(Debug, Clone)]
struct Dummy;

type FutResult = BoxFuture<'static, web3::error::Result<Value>>;

impl Transport for Dummy {
    type Out = FutResult;

    fn prepare(&self, _: &str, _: Vec<Value>) -> (RequestId, Call) {
        todo!()
    }

    fn send(&self, _: RequestId, _: Call) -> Self::Out {
        Box::pin(async {
            Ok(Value::Null)
        })
    }
}

pub fn main() -> web3::error::Result<()> {
    // let transport = web3::transports::Http::new("http://localhost:8545")?;
    let web3 = web3::Web3::new(Dummy);

    let eth = web3.eth();
    println!("Calling accounts.");
    let accounts: CallFuture<Vec<Address>, FutResult> = eth.accounts();
    let accounts: web3::Result<Vec<Address>> = task::block_on(accounts);
    let mut accounts = accounts?;
    println!("Accounts: {:?}", accounts);
    accounts.push("00a329c0648769a73afac7f9381e08fb43dbea72".parse().unwrap());

    println!("Calling balance.");
    for account in accounts {
        let balance = task::block_on(web3.eth().balance(account, None))?;
        println!("Balance of {:?}: {}", account, balance);
    }

    Ok(())
}
