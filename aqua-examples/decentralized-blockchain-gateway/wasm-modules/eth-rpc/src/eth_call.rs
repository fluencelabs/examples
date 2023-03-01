use eyre::eyre;
use marine_rs_sdk::marine;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio::runtime::Builder;
use web3::Transport;

use crate::curl_transport::CurlTransport;
use crate::values::JsonString;

#[marine]
pub fn eth_call(uri: String, method: &str, json_args: Vec<String>) -> JsonString {
    let result: eyre::Result<Value> = try {
        let rt = Builder::new_current_thread().build()?;

        let args: Result<Vec<Value>, _> =
            json_args.iter().map(|a| serde_json::from_str(a)).collect();
        let args = args.map_err(|err| {
            eyre!("Invalid arguments. Expected JSON serialized to string, got {json_args:?}: {err}")
        })?;
        let transport = CurlTransport::new(uri);
        let result = rt.block_on(transport.execute(method, args))?;

        result
    };

    result.into()
}

#[marine]
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct RPCResult {
    provider_name: String,
    stdout: String,
    stderr: String,
}

pub fn eth_call_2(uri: String, method: &str, json_args: Vec<String>) -> JsonString {
    let result: eyre::Result<Value> = try {
        let rt = Builder::new_current_thread().build()?;

        let args: Result<Vec<Value>, _> = json_args
            .into_iter()
            .map(|a| serde_json::from_str(&a))
            .collect();
        let transport = CurlTransport::new(uri);
        let result = rt.block_on(transport.execute(method, args?))?;

        result
    };

    result.into()
}

#[cfg(test)]
mod tests {
    use marine_rs_sdk_test::marine_test;

    #[marine_test(
        config_path = "../tests_artifacts/Config.toml",
        modules_dir = "../tests_artifacts"
    )]
    fn get_accounts_bad_uri(rpc: marine_test_env::eth_rpc::ModuleInterface) {
        let uri: String = "http://bad_uri.to".into();
        let method: String = "eth_accounts".into();
        let json_args: Vec<String> = vec![];

        let accounts = rpc.eth_call(uri, method, json_args);
        println!("bad uri call: {:?}", accounts);
        // println!("accounts: {:?}", accounts);
        // assert_eq!(accounts.len(), 0);
    }

    #[marine_test(
        config_path = "../tests_artifacts/Config.toml",
        modules_dir = "../tests_artifacts"
    )]
    fn get_accounts_bad_method(rpc: marine_test_env::eth_rpc::ModuleInterface) {
        let uri: String = std::fs::read_to_string("./infura_uri.txt").unwrap();
        let method: String = "eth_getAccounts".into();
        let json_args: Vec<String> = vec![];

        let accounts = rpc.eth_call(uri, method, json_args);
        println!("bad method: {:?}", accounts);
    }

    #[marine_test(
        config_path = "../tests_artifacts/Config.toml",
        modules_dir = "../tests_artifacts"
    )]
    fn get_accounts_good_uri(rpc: marine_test_env::eth_rpc::ModuleInterface) {
        let uri: String = std::fs::read_to_string("./infura_uri.txt").unwrap();
        let method: String = "eth_accounts".into();
        let json_args: Vec<String> = vec![];

        let accounts = rpc.eth_call(uri, method, json_args);
        println!("all good: {:?}", accounts);

        // println!("accounts: {:?}", accounts);
        // assert_eq!(accounts.len(), 0);
    }

    #[marine_test(
        config_path = "../tests_artifacts/Config.toml",
        modules_dir = "../tests_artifacts"
    )]
    fn get_transaction(rpc: marine_test_env::eth_rpc::ModuleInterface) {
        use serde_json::json;

        let uri: String = todo!("put Goerli ETH RPC URL here");
        let method: String = "eth_getTransactionByHash".into();
        let json_args: Vec<String> =
            vec![
                json!("0x3ffaa16b93ef90b9385b6f6a140d8297c43b6551bf8e8b804d9eecff7bc1509f")
                    .to_string(),
            ];

        let result = rpc.eth_call(uri.clone(), method.clone(), json_args);
        assert!(result.success, "{}", result.error);
        assert_eq!(result.value, "null", "{}", result.value);

        let json_args: Vec<String> =
            vec!["0x3ffaa16b93ef90b9385b6f6a140d8297c43b6551bf8e8b804d9eecff7bc1509f".into()];

        let result = rpc.eth_call(uri, method, json_args);
        assert!(!result.success);
        assert!(
            result
                .error
                .starts_with("Invalid arguments. Expected JSON serialized to string"),
            "{}",
            result.error
        );
    }
}
