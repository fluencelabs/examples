# EthDenver Virtual '21 Fluence Hackathon  

## Introduction  
This quickstart aims to get teams up and running with the Fluence stack and Ethereum. If you're new to Fluence, give the ol' [documentation](https://fluence.dev/docs) a gander before diving in. Please note that the Fluence stack is under heavy development. If you find errors, incompatibilities or the dreaded dead link, post an issue or even better, push a PR.

## Quickstart
The point of this tutorial is to get you up-to-speed and productive with the Fluence stack as quickly as possible in the context of Web3 development. To this end, we bootstrap from a few [Ethereum JSON-RPC](https://eth.wiki/json-rpc/API) calls to a stylized frontend and cover all the good stuff along the way. If you haven't had a chance to work through the [greeting example](https://fluence.dev/docs/how-to-develop-a-module), this might be a good time. For additional examples, check out the [fce](https://github.com/fluencelabs/fce/tree/master/examples) repo and the [fluent pad](https://github.com/fluencelabs/fluent-pad) and [aqua demo](https://github.com/fluencelabs/aqua-demo) demos.

Before we dive in, setup your [Rust](https://www.rust-lang.org/tools/install) and [Fluence environment](https://fluence.dev/docs/how-to-develop-a-module) if you haven't done so already, clone this repo to your machine or instance:

```bash
git clone git@github.com:fluencelabs/ethdenver-hackathon.git
cd ethdenver-hackathon
```

and build the examples: 

```bash
cd web3-examples
./build.sh
```

if you get a permission error, `chmod +x build.sh` and while we're at it, add:

```bash
mkdir artifacts
```

where the artifacts directory serves as a convenient destination for the wasm files we create with the build process.

Recall from the [create a service](https://fluence.dev/docs/services-development) docs that a service is comprised of one or more modules. For for the purposes of a our tutorial, we are working with a "fat" service, i.e., one service with multiple modules. For all intents and purposes, this is not advisable but helpful for keeping things tight for this overview.

Before we proceed, make sure you have an ethereum node running and ready to connect. If you prefer to use a node-as-a-service, we recommend [Alchemy](https://www.alchemyapi.io/), which offers a generous free account.
### Getting Started With Fluence and Web3 Services  
[WASM](https://developer.mozilla.org/en-US/docs/WebAssembly) is a relatively new concept and WASM for backend  is even newer, e.g., [wasmer](https://github.com/wasmerio/wasmer), [WASI](https://github.com/CraneStation/wasi), but maturing at a rapid clip. Yet, there are still limitations we need to be aware of. For example, sock support and async capabilities are currently not available. Not to worry, we can work around those constraints without too much heavy lifting and still build effective solutions.

For the time being, our go-to transport comes courtesy of [curl](https://curl.se/docs/) as a service. Please note that since curl generally does not provide web socket (ws, wss) capabilities, https is our transport tool of choice. This has a few implications especially when it comes blockchain client access as a service. For example, a subset of the Ethereum JSON RPC calls in [Infura](https://infura.io/docs/ethereum/wss/introduction), are only accessible via wss. Luckily, [Alchemy](https://www.alchemyapi.io/) offers a viable alternative for those not running their own node. Using curl generally has no performance penalties and in most cases actually speeds things up but it should be noted that leaving the WASM sandbox comes at a cost: a node provider can easily monitor and exploit curl call data, such as api-keys. If that is a concern, we recommend you run your own node; if it is more of a testnet concern, we recommend using project-specific api-keys, and rotate them periodically.

As mentioned earlier, async is currently not quite there but the Fluence team has implemented a [cron-like](https://fluence.dev/docs/built-in-services#script-add) script to allow polling as part of the native node services.

From a development perspective, a little extra care needs to be taken with respect to error management. Specifically, Result<_,_> does not work out of the box in WASI. If you want to return a Result, you need to implement your own. See the [example](facade/src/fce_results.rs) code.

In the web3-examples folder, we illustrate the core concepts of Web3 service development with a few Ethereum JSON-RPC calls. In a nutshell, [FCE](https://github.com/fluencelabs/fce) compliant services are written and compiled with `fce build`. Let's install the tool:

```bash
cargo install fcli
```

Or see the Fluence [documentation](https://fluence.dev/docs/setting-up-the-development-environment) for a step-by-step dev setup.

The resulting WASM modules can then be locally inspected and executed with the Fluence repl, `fce-repl`, e.g.:

```bash
mbp16~/localdev/ethdenver-hackathon/web3-examples(main|✚3…) % fce-repl Config.toml
Welcome to the FCE REPL (version 0.1.33)
app service was created with service id = 78f2f68f-cec6-4134-b69e-e4826dc2a846
elapsed time 180.489951ms

1> help
Commands:

n/new [config_path]                       create a new service (current will be removed)
l/load <module_name> <module_path>        load a new Wasm module
u/unload <module_name>                    unload a Wasm module
c/call <module_name> <func_name> [args]   call function with given name from given module
i/interface                               print public interface of all loaded modules
e/envs <module_name>                      print environment variables of a module
f/fs <module_name>                        print filesystem state of a module
h/help                                    print this message
q/quit/Ctrl-C                             exit
```

### A Simple Example
Let's have a look at one of the examples, eth_get_balance, from `eth_calls_test.rs`:  

```rust
#[fce]
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
    let response: String = curl_request(vec![curl_args]);
    check_response_string(response, &id)
}
```  

This code snippet is based on the Ethereum JSON-RPC API [eth_getBalance](https://eth.wiki/json-rpc/API#eth_getbalance) and returns the balance of the named account for the destination chain specified. We implement that method by combining our custom code with the [curl module](https://fluence.dev/docs/creating-a-service#curl-module). This call should look familiar to most dAPP developers, although Web3 libraries abstract over the raw calls.

So what's going on?
1.  We apply the fce macro to the function, which returns our custom [JsonRpcResult](facade/src/results.rs)
2.  We specify the actual method name, which by the way, may deviate from the Ethereum spec's depending on the eth-client provider. See [eth_filters.rs](facade/src/eth_filters.rs) for an example.
3.  We generate our nonce, aka id, which is based on the thread-safe nonce counter, NONCE_COUNTER, implemented in [eth_utils.rs](facade/src/eth_utis.rs):

```rust
pub static NONCE_COUNTER: AtomicUsize = AtomicUsize::new(1);
```

4. We handle our block_number parameters to makes sure it's either a valid (positive) number or one of the ["latest", "pending", "earliest"] parameter options. Note that some of the node-as-a-service providers do not provide historical data without users signing up for archive services.
5. Now we format our params and args into a json-rpc dict suitable for curl consumption. 
6.  We finally check our response and return the result

We can now run that function in Fluence Repl with `fce-repl Config.toml` from the web3-examples directory.:
```bash
1> call facade eth_get_balance  ["https://eth-mainnet.alchemyapi.io/v2/<your key>", "0x0000000000000000000000000000000000000000", "latest"]
curl args: -X POST --data '{"jsonrpc":"2.0", "method": "eth_getBalance", "params":["0x0000000000000000000000000000000000000000", "latest"], "id":2}' https://eth-mainnet.alchemyapi.io/v2/<your key>
INFO: Running "/usr/bin/curl -X POST --data {"jsonrpc":"2.0", "method": "eth_getBalance", "params":["0x0000000000000000000000000000000000000000", "latest"], "id":2} https://eth-mainnet.alchemyapi.io/v2/<your key>" ...
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   182  100    62  100   120     83    161 --:--:-- --:--:-- --:--:--   243
result: Object({"error": String(""), "id": Number(2), "jsonrpc": String("2.0"), "result": String("0x1c804d8c47f4e326821")})
 elapsed time: 756.728025ms
2>
```

Before we dive into what's been happening, make sure you are familiar with the [Fluence REPL](https://fluence.dev/docs/fluence-repl) and the construction of [Config.toml](Config.toml).

We specify that we want to `call` the `eth_get_balance` function from the `facade` module with our Ethereum node `url` and `latest` block parameters.
Note that for the purpose of the examples, we return the raw result(s), which are usually hex strings; due to the Result limitations discussed earlier, you need to explicitly check the error string before processing the result. In a general manner, this entails:

```rust
    // <snip>
    let result =  JsonRpcResult {error: "".to_string(), 
                                 id: 2u64,
                                 jsonrpc: "2.0".to_string(),
                                 result: "0x1c804d8c47f4e326821".to_string()};
    match result.error.len() {
       0 => println!("do something with ok such as {}", u128::from_str_radix(result[2..], 16)),
        _ => println!("do something with err")
    }
```

#### A Note On Testing  
Due to current limitations in WASI, Rust unit tests proper are not working for fce modules when an external binary, such as curl, is imported. A workaround is to implement fce mearked-up test functions and run them in fce-repl. The examples below are based on `eth_getBalance` call discussed above.

```rust
#[fce]
fn test_eth_get_balance_good(url: String) -> TestResult {
    let burn_address = String::from("0x0000000000000000000000000000000000000000");
    let block_height = String::from("latest");
    // burn account balances, min, per 1/27/21:
    // https://etherscan.io/address/0x0000000000000000000000000000000000000000; 8412.0
    // https://kovan.etherscan.io/address/0x0000000000000000000000000000000000000000; 213.0
    // https://rinkeby.etherscan.io/address/0x0000000000000000000000000000000000000000; 1566.0
    // https://goerli.etherscan.io/address/0x0000000000000000000000000000000000000000; 1195.0

    let result = eth_get_balance(url, burn_address, block_height);
    let hex_balance: String = result.result;
    let wei_balance: u128 = u128::from_str_radix(&hex_balance[2..], 16).unwrap();
    let eth_balance: f64 = wei_to_eth(&wei_balance);
    if eth_balance > 213.0 {
        return TestResult::from(Result::from(Ok(String::from(""))));
    }
    let err_msg = format!("expected: gt {}, actual {:.2}", 213.0, eth_balance);
    TestResult::from(Result::from(Err(err_msg)))
}

#[fce]
fn test_eth_get_balance_bad(url: String) -> TestResult {
    let burn_address = String::from("0x0000000000000000000000000000000000000000");
    let block_height = String::from("latest");
    // burn account balances, min, per 1/27/21:
    // https://etherscan.io/address/0x0000000000000000000000000000000000000000; 8412.0
    // https://kovan.etherscan.io/address/0x0000000000000000000000000000000000000000; 213.0
    // https://rinkeby.etherscan.io/address/0x0000000000000000000000000000000000000000; 1566.0
    // https://goerli.etherscan.io/address/0x0000000000000000000000000000000000000000; 1195.0

    let result = eth_get_balance(url, burn_address, block_height);
    let hex_balance: String = result.result;
    let wei_balance: u128 = u128::from_str_radix(&hex_balance[2..], 16).unwrap();
    let eth_balance: f64 = wei_to_eth(&wei_balance);
    if eth_balance > 1_000_000.0 {
        return TestResult::from(Result::from(Ok(String::from(""))));
    }
    let err_msg = format!("expected: gt {}, actual {:.2}", 1_000_000, eth_balance);
    TestResult::from(Result::from(Err(err_msg)))
}
```

Here we test `eth_get_balance` with the burn address "0x0000000000000000000000000000000000000000" for the the latest block and return the result as [TestResult](facade/src/eth_utils.rs). Running the functions in fce-repl:

```bash
2> call facade test_eth_get_balance_bad  ["https://eth-mainnet.alchemyapi.io/v2/<your key>"]
curl args: -X POST --data '{"jsonrpc":"2.0", "method": "eth_getBalance", "params":["0x0000000000000000000000000000000000000000", "latest"], "id":1}' https://eth-mainnet.alchemyapi.io/v2/<your key>
INFO: Running "/usr/bin/curl -X POST --data {"jsonrpc":"2.0", "method": "eth_getBalance", "params":["0x0000000000000000000000000000000000000000", "latest"], "id":1} https://eth-mainnet.alchemyapi.io/v2/<your key>" ...
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   182  100    62  100   120    123    238 --:--:-- --:--:-- --:--:--   360
result: Object({"error": String("expected: gt 1000000, actual 8412.06"), "test_passed": Number(0)})
 elapsed time: 516.627078ms

3> call facade test_eth_get_balance_good  ["https://eth-mainnet.alchemyapi.io/v2/<your key>"]
curl args: -X POST --data '{"jsonrpc":"2.0", "method": "eth_getBalance", "params":["0x0000000000000000000000000000000000000000", "latest"], "id":2}' https://eth-mainnet.alchemyapi.io/v2/<your key>
INFO: Running "/usr/bin/curl -X POST --data {"jsonrpc":"2.0", "method": "eth_getBalance", "params":["0x0000000000000000000000000000000000000000", "latest"], "id":2} https://eth-mainnet.alchemyapi.io/v2/<your key>" ...
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   182  100    62  100   120    164    319 --:--:-- --:--:-- --:--:--   482
result: Object({"error": String(""), "test_passed": Number(1)})
 elapsed time: 387.537328ms

4>
```  

That's it !!

#### A Note on Service Granularity
While there are no hard and fast rules to determine optional service granularity, [theory](https://onlinelibrary.wiley.com/doi/full/10.1002/spe.2869) and common sense do help. Let's look at what could be a fine-grained, self-contained service: A service that could generate the [method id](https://docs.soliditylang.org/en/latest/abi-spec.html) for Ethereum smart contract functions. A simple method id [generator](facade/src/eth_hashers.rs) may look like this:

```rust
use marine_rs_sdk::fce;
use tiny_keccak::Sha3;

#[fce]
pub fn eth_hash_method_id(input: Vec<u8>) -> Vec<u8> {
    let mut output = [0u8; 32];
    let mut keccak = Keccak::v256();

    keccak.update(&input);
    keccak.finalize(&mut output);
    output.to_vec()
}
```

with the corresponding test:

```rust
#[fce]
pub fn test_eth_hash_method_id() -> String {
    use hex::encode;

    // see https://docs.soliditylang.org/en/latest/abi-spec.html#examples
    let input = b"baz(uint32,bool)".to_vec();
    let expected = String::from("cdcd77c0");
    let res = eth_hash_method(input);
    let res = format!("{}", hex::encode(&res[..4]));

    if res == expected {
        return "test passed".to_string();
    }
    "test failed".to_string()
}
```

and fce-repl execution:

```bash
fce-repl Config.toml
<snip>
4> call facade test_eth_hash_method []
result: String("test passed")
 elapsed time: 98.266µs

5>
```

### Deploying our Services  
The next step is to upload our work to the network, in this case the Fluence test network.
Recall that you can inspect all interfaces with the fce-repl tool, e.g.:

```
mbp16~/localdev/lw3d/web3-examples(main|✚4…) % fce-repl Config.toml
Welcome to the Fluence FaaS REPL
app service's created with service id = 06acbe9e-f598-4e34-98d0-1d71117450ce
elapsed time 138.917556ms

1> interface
Application service interface:
TestResult {
  test_passed: I32
  error: String
}
JsonRpcResult {
  jsonrpc: String
  result: String
  error: String
  id: U64
}

facade:
  fn test_drop_outliers_and_average()
  fn get_filter_changes(url: String, filter_id: String) -> String
  fn uninstall_filter(url: String, filter_id: String) -> I32
  fn eth_hash_method_id(input: Array<U8>) -> Array<U8>
  fn test_eth_get_tx_by_hash(url: String, tx_hash: String)
  fn test_simple_average()
  fn eth_get_tx_by_hash(url: String, tx_hash: String) -> String
  fn test_pending_with_null_filter(url: String) -> String
  fn simple_average(data: Array<String>) -> String
  fn test_eth_hash_method_id() -> String
  fn new_pending_tx_filter(url: String) -> String
  fn test_eth_get_balance_good(url: String) -> TestResult
  fn sum_data(data: Array<String>) -> String
  fn eth_get_balance(url: String, account: String, block_number: String) -> JsonRpcResult
  fn test_filters(url: String) -> TestResult
  fn eth_get_block_height(url: String) -> JsonRpcResult
  fn test_eth_get_balance_bad(url: String) -> TestResult
  fn drop_outliers_and_average(data: Array<String>) -> String

curl_adapter:
  fn curl_request(url: String) -> String

```

First, we need some [tooling](https://fluence.dev/docs/upload-example-to-the-fluence-network):

```bash
npm i @fluencelabls/fldist -g
```

This installs the Fluence [proto distributor](https://github.com/fluencelabs/proto-distributor), which makes deploying our service(s) quite easy. It also includes some magic to get your services to the right test network node(s). You may recall the steps to deploy our service from the [documentation](https://fluence.dev/docs/service-lifecycle):

1. Upload the module(s)
2. Create the blueprint(s)
3. Create the service(s)

Since our project is structured as a "fat" service, we have two modules, see your artifacts directory, and one service. Let's get busy and upload our modules to the network:

```bash 
mbp16~/localdev/lw3d/web3-examples(main↑4|✚2…) % fldist upload -c curl_adapter/Config.json -p artifacts/curl_adapter.wasm -n curl_adapter
seed: 8Nr1bfAkLzFKknwJzq5RGSkNMo9Hqk1ukF2bf7QkcBB5
uploading module curl_adapter to node 12D3KooWBUJifCTgaxAUrcM9JysqCcS4CS8tiYH5hExbdWCAoNwb via client 12D3KooWRNGvgejbeY3aceVprwsPGgaVzvXeWGVeM8YY478JfRfE
module uploaded successfully
mbp16~/localdev/lw3d/web3-examples(main↑4|✚3…) % fldist upload -c facade/Config.json -p artifacts/facade.wasm -n web3_facade
seed: AGjAP2TgthBuVJ3mESPJMRncKkamU1aMkyL4FLb4t529
uploading module web3_facade to node 12D3KooWBUJifCTgaxAUrcM9JysqCcS4CS8tiYH5hExbdWCAoNwb via client 12D3KooWJeoiuxZuRhK91CcwcrHfGvZAekhVHrMkRDvEBnYDbkMQ
fldist upload
```

Here we uploaded both modules to the test network with `fldist upload`. Make sure your module names are unique. That is, don't use
<i>web3_test_curl_1</i> and <i>web3_test_functions</i> but come up with your own names. You can use `fldist get_modules` to get a list of all modules and their respective names on a node. Make sure you retain the response data! 

Let's use the `fldist` cli to verify our uploads:

```bash
mbp16~/localdev/lw3d/web3-examples(main↑4|✚3…) % fldist get_modules -s  8Nr1bfAkLzFKknwJzq5RGSkNMo9Hqk1ukF2bf7QkcBB5
[[{"interface":{"function_signatures":[{"arguments":[["url","String"],["file_name","String"]],"name":"get_n_save",<snip>

mbp16~/localdev/lw3d/web3-examples(main↑4|✚3…) % fldist get_modules -s AGjAP2TgthBuVJ3mESPJMRncKkamU1aMkyL4FLb4t529
[[{"interface":{"function_signatures":[{"arguments":[["url","String"],["file_name","String"]],"name":"get_n_save" <snip>
```

Looks lie we are good to go to the next step: Deploy our [blueprint](https://fluence.dev/docs/service-lifecycle#blueprints), which essentially is a configuration object. Let's design one:

```
blueprint:
```json
{
     "id": dc0b258-65f0-11eb-bf24-acde48001132",
     "name": "eth_test_1",
     "dependencies": [ "curl_adapter", "facade"]
}
```  

The blueprint id is a UUID that you need to generate . Don't reuse the one in the examples. We give our service-to-be a unique name and finally, we associate the necessary modules in dependencies. That's it. Of course, we need a blueprint for each service we want to deploy. To deploy a blueprint, we:

```bash
mbp16~/localdev/lw3d/web3-examples(main↑4|✚3…) % fldist add_blueprint -i dc0b258-65f0-11eb-bf24-acde48001132 -d curl_adapter web3_test_functions -n eth_test_fat_service_01 -s 7sHe8vxCo4BkdPNPdb8f2T8CJMgTmSvBTmeqtH9QQrar
uploading blueprint eth_test_fat_service_01 to node 12D3KooWBUJifCTgaxAUrcM9JysqCcS4CS8tiYH5hExbdWCAoNwb via client 12D3KooW9r3GAnRBa2RthsmTJq9tuvHvSFFJfN71hhcoErSBkFsZ
blueprint 'dc0b258-65f0-11eb-bf24-acde48001132' added successfully
```

We use the `fldist add_blueprint` command and add our blueprint id with the -i flag, the name with -n flag, and the dependencies with the -d flag. So what's the -s flag? It's our client seed which is our gateway to [security](https://fluence.dev/docs/security-model). Fundamentally, the client seed is created as a base58 encoding of your ED25119 secret key. If you don't have a keypair, you can use <i>fldist</i> to create one:

```bash
mbp16~(:|✔) % fldist create_keypair
{
  id: '12D3KooWKW51pN9M5xx9aBiLXm9VnZryoj6poj1e8AycVYiiPzBh',
  privKey: 'CAESYHwBglTBz5A4SaNXYVt8CrpYos8y3vEqU6gm6MympmUMj+UEygty3m6HJE/fM1hP1qe1l82s9k3w9uKTXLqyY9CP5QTKC3LebockT98zWE/Wp7WXzaz2TfD24pNcurJj0A==',
  pubKey: 'CAESII/lBMoLct5uhyRP3zNYT9antZfNrPZN8Pbik1y6smPQ',
  seed: '9M4taDKCDsJnjcmjHV8RuuW4Zj3fBU1MmKK1cKbwVUhq'
}
```

where `seed` parameterizes the -s flag. Make sure you safely retain this info.

Before we proceed, make sure you grab the client reference.e.g., 12D3KooW9r3GAnRBa2RthsmTJq9tuvHvSFFJfN71hhcoErSBkFsZ, and node reference, 12D3KooWBUJifCTgaxAUrcM9JysqCcS4CS8tiYH5hExbdWCAoNwb, for future use. Now we have our modules and blueprints on the network and can instantiate our service:

```bash
mbp16~/localdev/lw3d/web3-examples(main↑4|✚3…) % fldist create_service  -i dc0b258-65f0-11eb-bf24-acde48001132  -s 7sHe8vxCo4BkdPNPdb8f2T8CJMgTmSvBTmeqtH9QQrar
client seed: CovY7pi37Hksxk6KvLoiYT6udHXSF8C86YrtFPnswenj
client peerId: 12D3KooWEUd1RYhbDESfgjw1XiZe7wrFXK1DQ97r7TZdXPXHpSTM
node peerId: 12D3KooWBUJifCTgaxAUrcM9JysqCcS4CS8tiYH5hExbdWCAoNwb
creating service dc0b258-65f0-11eb-bf24-acde48001132
fldist create_service
```

This gives you the service id, dc0b258-65f0-11eb-bf24-acde48001132, and node id, 12D3KooWBUJifCTgaxAUrcM9JysqCcS4CS8tiYH5hExbdWCAoNwb. Now we can check on our final result:

```bash
fldist get_interfaces -p 12D3KooWBUJifCTgaxAUrcM9JysqCcS4CS8tiYH5hExbdWCAoNwb|grep dc0b258-65f0-11eb-bf24-acde48001132
```

So far so good. Now we are all dressed up and need somewhere to go. In the next section we put it all together in a frontend application. If you haven't had time to look over the various example [filter functions](facade/src/eth_filters.rs), this is a good time to do so.
### Frontend
Our frontend is quite simple but more than suffices to illustrate and work through the key concepts of using our deployed modules and services. The task at hand is to install the [eth_newPendingTransactionFilter](https://eth.wiki/json-rpc/API#eth_newpendingtransactionfilter) and to periodically poll with [eth_getFilterChanges](https://eth.wiki/json-rpc/API#eth_getfilterchanges) from our deployed services. The result is a table of pending transaction data including tx hash and gas. Why checkout pending transactions? Well, it's good for just about anything from looking for front-running opportunities to arriving at pretty accurate gas estimates and transaction backlogs, aka mainnet congestion.

Before we dive into the meaty details, let's take the frontend for a spin. From the repo root:

```bash
cd /web-frontend
npm install
npm start
```

Now open a tab in browser and navigate to `localhost:3000`, enter your Ethereum mainnet client url, and press the proverbial start button and pretty soon you should see your Fluence services go to work -- fetching, filtering, and transforming pending transaction data on the Fluence test network. Right on and a long time coming.

