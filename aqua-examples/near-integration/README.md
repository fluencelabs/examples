# NEAR + Fluence + Aqua Integrations
## Overview

We provide integration examples for both a [Fluence JS](https://github.com/fluencelabs/fluence-js) node based on the [NEAR API JS](https://docs.near.org/docs/api/javascript-library) and distributed [Wasm services](https://github.com/fluencelabs/marine) wrapping the [NEAR RPC API](https://docs.near.org/docs/api/rpc). A [NEAR CLI](https://docs.near.org/docs/tools/near-cli) integration is planned for the near future.

## Fluence JS NEAR Signing Peer

Signing transactions and messages is a critical operation both on- and off-chain and an integral part of most Web3 workflows. In Fluence's open, permissionless peer-to-peer network maintaining data privacy is a challenge. For example, passing the password for a keyfile or the private key itself is quite risky: while a peer-to-peer communication channel is end-to-end encrypted, the "end" of the channel is the node hosting the target service. Hence, a node can easily eavesdrop on decrypted traffic and abscond with your password or key and presumably, your funds. Of course, you can run your own node to eliminate such exploits. Rather than run a full-fledged Rust node for a limited scope requirement, a more advantageous solution might be to implement a Fluence Signing Node (FSN) with Node JS and Fluence JS, which is exactly what we have done for this example. While a Fluence JS peer does not allow for the hosting of arbitrary services at this point, it does allow to easily wrap the NEAR JS SDK and expose whatever interfaces you want to be used/composed with Aqua.


### Implementing a Peer Node With Fluence JS and Aqua

As discussed in the [documentation](https://doc.fluence.dev/docs/fluence-js/5_run_in_node), we can use [Fluence JS](https://github.com/fluencelabs/fluence-js) in a Node JS application resulting in a viable peer node of the Fluence p2p network. If you haven't, have a look at the documentation before you continue. To follow along the code below:

```bash
cd near-signing-node
```

In order to create our signing node, we wrap the [NEAR JS SDK](https://docs.near.org/docs/api/javascript-library) and, for a minimally viable experiment, expose the [sendMoney](https://near.github.io/near-api-js/classes/account.account-1.html#sendmoney) and a couple non-signing functions.

In order to be able to expose `sendMoney` as an addressable service to Aqua, we need to implement the `sendMoney` interface and function in Aqua:

```aqua
-- near_signing_node.aqua
func send_money(network_id:string, account_id:string, receiver_id:string, amount:string, password: string, node:string, relay:string) -> string:
    on node via relay:
        res <- NearSignerApi.send_money(network_id, account_id, receiver_id, amount)
    <- res
```

Note that we added additional parameters to our `sendMoney` implementation: *near-api-js* specifies the `sendMoney` function with two parameters -- the receiver id and amount. Since `sendMoney` is associated with `Account`, we need to add the `from` wallet address as well as the `network_id` to be able to activate the appropriate account on the desired NEAR network. In addition, our exposed `sendMoney` service runs on a peer-to-peer node and in order to be able to locate and execute the service, we need to provide the node's `peer id` and `relay id`. Finally, we guard our service with stylized authentication for which we use the `password` parameter. That is, on the peer <peer_id>, which we reach via the relay <relay_id> and assuming the <password> checks out, we eventually execute:

```typescript
sendMoney(receiverId: string, amount: BN)
```

Once we compile Aqua with the `npm run compile aqua` command, which writes the Typescript output into the `/src/_aqua` dir, we can then use the generated code, see `src/_aqua/near_signing_node.ts`, to implement our `sendMoney` service and any of ther other interfaces specified in Fluence JS, which essentially follows the [NEAR example](https://docs.near.org/docs/api/naj-quick-reference#send-tokens):  

```typescript
// index.ts
async send_money(network_id: string, account_id: string, receiver_id: string, amount: string, password: string): Promise<any> {
        if (!this.password_checker(password)) {
            return Promise.resolve("Not Authorized")
        }
        const config = get_config(network_id, this._keyStore);
        const near = await network_connect(config);
        let account = await near.account(account_id);
        let tx_receipt = await account.sendMoney(receiver_id, amount)
        // return Promise.resolve(tx_receipt);
        let result = Promise.resolve(tx_receipt);
        return result;
    }
```


Just like in the **quickstart example**, we implement the `send_money` method for the `class NearSigner implements NearSignerApiDef` class, where `NearSignerApiDef` is generated code from the Aqua compilation and which we register (as an exposed service) in `async main` like so:

```typescript
// index.ts
async function main() {
    // ...
    registerNearSignerApi("near", new NearSigner());
    // ...
```

For the complete implementation details, see `src/index.ts`. Before we test our code, please note that in this implementation the wallet credentials are presumed to be in the `~/.near-credentials` directory of the machine/system that runs the Fluence Signing Node. For *testnet* wallets, see https://wallet.testnet.near.org/ and https://docs.near.org/docs/develop/basics/create-account, to get started.

Note the implementations of `account_state` and `get_balance`, which follow the same implementation pattern discussed above but actually do not require account or wallet access.

### Running And Interacting With The Fluence Peer

Open two terminal windows in the `~/near-examples/near-signing-node/` directory to launch the peer and a client peer, respectively. Please note that you can use the peer with a local Fluence node or the testnet. For our purposes, we will be using Fluence's `krasnodar` testnet.

Install the dependencies with:

```bash
# setup the node
npm i
```

Then compile Aqua:

```bash
# compile aqua
npm run compile-aqua
```

Which produces output similar to:

```bash
> near-signing-node@0.1.0 compile-aqua
> aqua -i aqua/ -o src/_aqua

2021.12.14 00:22:34 [INFO] Aqua Compiler 0.5.0-SNAPSHOT
2021.12.14 00:22:34 [INFO] Result /Users/bebo/localdev/examples/aqua-examples/near-integration/near-signing-node/src/_aqua/near_signing_node.ts: compilation OK (3 functions, 1 services)
2021.12.14 00:22:34 [INFO] Result /Users/bebo/localdev/examples/aqua-examples/near-integration/near-signing-node/src/_aqua/near_demo.ts: compilation OK (2 functions, 1 services)
```

You can check the generated Typescript and AIR code in the `src/_aqua` directory. With our setup complete, let's start the peer:

```bash
# start the node
npm start
````

Which produces output similar to:

```bash
> near-signing-node@0.1.0 start
> node -r ts-node/register src/index.ts

PeerId:  12D3KooWLCaFtoq9uu1jFg38uZXU4fNAkcL5X3xoQu6UqFxRFavU
Relay id:  12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi
ctrl-c to exit
```

Please take note of the **relay id** and **peer id** for use in your client peer. In order to call the `account_state` method, open a new terminal window and navigate to the `~/examples/aqua-examples/near-integration/near-signing-node` directory and execute:

```bash
aqua run \
    -i aqua -a "/dns4/kras-04.fluence.dev/tcp/19001/wss/p2p/12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi"  \
    -f 'account_state("testnet", "<your account>", "lame_password", "<peer id>", "relay id")'
```

*Replace* `<your account>` with your testnet account and `<peer id>` and `<relay id>` with the values provided by your peer output as discussed above. Once you've done that, the output should be similar to:

```bash
Your peerId: 12D3KooWJYGtESBvtLiCyY1XUrXR5WYBtfAU697SqVnwi5XmqkqW
[
  {
    "amount": "199998727964846286399080000",
    "block_hash": "5Ves5ocsxmUSbsh6ZF5wutLiZSsPgm43H4H4zVDkacnA",
    "block_height": 74936860,
    "code_hash": "11111111111111111111111111111111",
    "locked": "0",
    "storage_paid_at": 0,
    "storage_usage": 674
  }
]
```

Similarly, we can call our `send_money` service with Aqua:

```aqua
 aqua run \
    -i aqua \
    -a "/dns4/kras-04.fluence.dev/tcp/19001/wss/p2p/12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi" \
    -f 'send_money("testnet", "<from account>", "<to account>", "10000", "lame_password", "<peer id>", "<relay id>")'
```

Replace the <`from`> and <`to`> account placeholders with your respective testnet wallets and the `peer id` and `relay id` with the values provided by your peer. Executing above Aqua statement produces a transaction receipt similar to the one below:

```bash

Your peerId: 12D3KooWG8yhYea2x8LiWWruLqRyrbHNAyq6oAj5jkjDLZe21YK1
[
  {
    "receipts_outcome": [
      {
        "block_hash": "7ZgHzMZsSirCxmJJ9tJJuHGjZBs1eG2tFWpYMBjYn9X1",
        "id": "7viub5UekSHHYi8ovEt5TuQNgtqZSgPx6EgUutv5i561",
        "outcome": {
          "executor_id": "<from account>",
          "gas_burnt": 223182562500,
          "logs": [],
          "metadata": {
            "gas_profile": [],
            "version": 1
          },
          "receipt_ids": [
            "E5ajp367DHvZcitj6eZ9nCE6rSYUmZi2njg9LnkdbZvM"
          ],
          "status": {
            "SuccessValue": ""
          },
          "tokens_burnt": "22318256250000000000"
        },
        "proof": [
          {
            "direction": "Right",
            "hash": "AD7yhCufivqSZHRuTuqATFjjhkY9AiBHPGSqLvmADKJh"
          },
          {
            "direction": "Right",
            "hash": "3fiJCKaok6BVoKMrgBHTedJWbeNU5nNJzpN82Kxjyw94"
          }
        ]
      },
      {
        "block_hash": "14EVqK6jpkKbkozEbdf5WrpxGAqzfq78kqj7Gv9smLBs",
        "id": "E5ajp367DHvZcitj6eZ9nCE6rSYUmZi2njg9LnkdbZvM",
        "outcome": {
          "executor_id": "<to account>",
          "gas_burnt": 223182562500,
          "logs": [],
          "metadata": {
            "gas_profile": [],
            "version": 1
          },
          "receipt_ids": [],
          "status": {
            "SuccessValue": ""
          },
          "tokens_burnt": "0"
        },
        "proof": [
          {
            "direction": "Left",
            "hash": "7cnaRc9PjGPHXd3fLngDQy8XQhmKtQXTPdrbq8Aas2Ti"
          }
        ]
      }
    ],
    "status": {
      "SuccessValue": ""
    },
    "transaction": {
      "actions": [
        {
          "Transfer": {
            "deposit": "10000"
          }
        }
      ],
      "hash": "3bmedi7erFPpwEWWgQHuMppoorvzed8x7w5mttofCVQw",
      "nonce": 74253069000003,
      "public_key": "ed25519:632DzcF3w7SLXJzDRcFdSHUBY2De8LECfJ9kCC4yERuj",
      "receiver_id": "<to account>",
      "signature": "ed25519:5zmMLczayMnnykBdn9MM3hUCWigZM5JgfAyT1E7mu7a4RNzPq9uahAKiGs1JWxNCor6zGHNbX8cpQYC59axxFtjR",
      "signer_id": "<from account>"
    },
    "transaction_outcome": {
      "block_hash": "J4gEefXV6FM1crRxxQbHhhVWpuPdPHnEAx5Kb5coCDdj",
      "id": "3bmedi7erFPpwEWWgQHuMppoorvzed8x7w5mttofCVQw",
      "outcome": {
        "executor_id": "<from account>",
        "gas_burnt": 223182562500,
        "logs": [],
        "metadata": {
          "gas_profile": null,
          "version": 1
        },
        "receipt_ids": [
          "7viub5UekSHHYi8ovEt5TuQNgtqZSgPx6EgUutv5i561"
        ],
        "status": {
          "SuccessReceiptId": "7viub5UekSHHYi8ovEt5TuQNgtqZSgPx6EgUutv5i561"
        },
        "tokens_burnt": "22318256250000000000"
      },
      "proof": []
    }
  }
]
```

You can use the [Testnet Explorer](https://explorer.near.org/) to further investigate the token transfer you just executed.

### Summary

In this section, we implemented a basic Fluence peer that outlines an approach to shield our NEAR wallet keys from other network participants and to implement singing related functionality, such as the `send_money` token transfer method. Additional methods, such as the more generic `sign transaction` and `deploy contract` can be easily implemented this way and we are looking forward to your pull requests. Also note, that our simple string return can be vastly improved by adding the appropriate *interfaces*.

In the next section, we briefly discuss how a variety of NEAR methods can be implemented as distributed, hosted services for easy deployment, re-use and scalability.

## Fluence Wasm NEAR Services

Operating your own node may not always be desireable for a variety of reasons ranging from costs to reuse to scalability and failover requirements. A core feature of the Fluence peer-to-peer network paradigm, of course, is the deployment of Wasm services to essentially any peer, given some hosting agreement, which allows for high portability as well as easy reuse and scalability as a "deploy and forget", low cost solution.  Even if the operation of a node is deemed necessary, as outlined in our Signing Node example above, it still may make sense to split services into a self-operated peer for signing-related activities and some hosted Wasm services otherwise. Of course, Aqua allows you to seamlessly compose any one of the (exposed) services regardless of the deployment approach.

In order to create a NEAR Wasm adapter, we wrap whatever functionality we need from the [NEAR RPC API](https://docs.near.org/docs/api/rpc) in our Wasm module(s).

### Creating And Deploying NEAR Wasm Services

In the `services` directory, you find a minimal Wasm adapter for [NEAR RPC API](https://docs.near.org/docs/api/rpc) to get you started. Since we are connecting to on-chain resources via JSON-RPC, we need our service module to have access to [cUrl](https://doc.fluence.dev/docs/tutorials_tutorials/curl-as-a-service), which we provide with the [cUrl adapter](../near-integration/services/curl-adapter/):

```rust
// src/main.rs
#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(cmd: Vec<String>) -> MountedBinaryResult;
}
```

Let's have a look at the implementation of the [`network status`](https://docs.near.org/docs/api/rpc/network#node-status) method, which provides a fairly extensive snapshot of the network at the time in inquiry. Our adapter, or wrapper, implementation needs to envelope the RPC [`status`](https://docs.near.org/docs/api/rpc/network#node-status) endpoint and requires only one parameter: the `network_id`', e.g., `testnet`:

```rust
// src.main.rs
// <snip>
#[marine]
pub struct Result {
    pub stderr: String,
    pub stdout: String,
}

#[marine]
pub fn node_status(network_id: String) -> Result {
    let method = "status".to_string();
    let url = url_maker(network_id);
    let params = "[]".to_string();
    let curl_params: Vec<String> = rpc_maker(url, method, params);
    let response = curl_request(curl_params);
    Result {
        stderr: String::from_utf8(response.stderr).unwrap(),
        stdout: String::from_utf8(response.stdout).unwrap(),
    }
}
```

Note that we use the `Result` struct to capture the curl response. 

Assuming you compiled the code with `./scripts/build.sh`, we can interact with the `node_status` in `mrepl`. Open the REPL with `mrepl configs/Config.toml` and:

```bash
mrepl configs/Config.toml
Welcome to the Marine REPL (version 0.9.1)
Minimal supported versions
  sdk: 0.6.0
  interface-types: 0.20.0

app service was created with service id = e9ecced7-521c-4dd7-b205-61c8da3be0da
elapsed time 91.995618ms

1> call near_rpc_services node_status ["testnet"]
result: Object({"stderr": String("  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current\n                                 Dload  Upload   Total   Spent    Left  Speed\n\r  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0\r100    68    0     0  100    68      0    110 --:--:-- --:--:-- --:--:--   110\r100  5384  100  5316  100    68   8091    103 --:--:-- --:--:-- --:--:--  8182\n"), "stdout": String("{\"jsonrpc\":\"2.0\",\"result\":{\"version\":{\"version\":\"1.23.0-rc.1\",\"build\":\"crates-0.10.0-70-g93e8521c9\"},\"chain_id\":\"testnet\",\"protocol_version\":49,\"latest_protocol_version\":49,
<snip>
\"latest_state_root\":\"CfxNRB5SNAiCmsMLbyAi7LD6YRVak7BH8REbumeg5GvD\",\"latest_block_time\":\"2021-12-08T09:20:24.293798434Z\",\"syncing\":false,\"earliest_block_hash\":\"CTBCW2Xm1xHeVKs3R5ZSULmVPc8Gj5tVVmH6HDrwRAeF\",\"earliest_block_height\":74004638,\"earliest_block_time\":\"2021-12-06T08:48:52.331327624Z\"},\"validator_account_id\":null},\"id\":\"dontcare\"}")})
 elapsed time: 666.350943ms

2>
...
```

As you can see, this is a straight mapping of the RPC response to the `Result` struct introduced above, which we can process in Aqua like so:

```aqua
-- some example aqua file
data Result:
    stderr: string
    stdout: string

service RPCService:
    node_status(network_id: string, block_ref:string) -> Result

func rpc_foo(network_id: string, block_ref:string, node_string, service_id: string ) -> string: 
    on node:
        RPCService service_id
        res <- RPCService.node_status(network_id, block_ref)
        if res.stderr:
            result <<- "call failed"
        else:
            result <<- res.stdout
        <- result
```

Before we can use our Fluence NEAR adapter, we need to deploy our Wasm modules to one or more host peers. We can do that with [Aqua CLI](https://doc.fluence.dev/aqua-book/aqua-cli):

```bash
aqua dist deploy \
     --addr /dns4/kras-04.fluence.dev/tcp/19001/wss/p2p/12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi \
     --data-path configs/near_deploy_cfg.json \
     --service near-adapter
```

Which gives us the deployment information:

```bash
Your peerId: 12D3KooWNg9YAJWzSRC5Wt2U38beXWAZQfZc2xxqVLVogRkSYKiv
"Going to upload a module..."
2022.02.07 01:58:44 [INFO] created ipfs client to /ip4/164.90.164.229/tcp/5001
2022.02.07 01:58:44 [INFO] connected to ipfs
2022.02.07 01:58:45 [INFO] file uploaded
"Going to upload a module..."
2022.02.07 01:58:45 [INFO] created ipfs client to /ip4/164.90.164.229/tcp/5001
2022.02.07 01:58:46 [INFO] connected to ipfs
2022.02.07 01:58:49 [INFO] file uploaded
"Now time to make a blueprint..."
"Blueprint id:"
"24b026f9b1b3f189d7998f875c0eb0c3394e546ee248ea292a27a555d3643774"
"And your service id is:"
"b39eb93d-0e7b-478c-976f-2e5b05ec02fb"
```

Please note the node id, "12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi", and service id "b39eb93d-0e7b-478c-976f-2e5b05ec02fb" for future use in our Aqua. Let's have a look at our aqua script in 'aqua/near_adapter_demo.aqua`:

```aqua
-- aqua/near_adapter_demo_aqua
func node_status(network_id: string, node: string, service_id: string) -> Result: 
    on node:
        NearRpcServices service_id
        res <- NearRpcServices.node_status(network_id)
    <- res
```

Which we can run with the `aqua cli`:

```bash
aqua run \
    -i aqua/near_adapter_demo.aqua \
    -a /dns4/kras-04.fluence.dev/tcp/19001/wss/p2p/12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi \
    -f 'node_status("testnet", "12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi", "b39eb93d-0e7b-478c-976f-2e5b05ec02fb")'
```

Which results in the following output:

```bash
Your peerId: 12D3KooWMWt2xWsqZxF3sEcBajsDRVARziKdyqkCoDXKeqYMnawm
{
  "stderr": "",
  "stdout": "{\"jsonrpc\":\"2.0\",\"result\":{\"version\":{\"version\":\"1.24.0-rc.2\",\"build\":\"crates-0.11.0-72-g6c5199f3b\"},\"chain_id\":\"testnet\",\"protocol_version\":51,\"latest_protocol_version\":51,\"rpc_addr\":\"0.0.0.0:4040\",\"validators\":[{\"account_id\":\"node1\",\"is_slashed\":false},{\"account_id\":\"node0\",\"is_slashed\":false},{\"account_id\":\"node2\",\"is_slashed\":false},{\"account_id\":\"node3\",\"is_slashed\":false},{\"account_id\":\"staked.pool.f863973.m0\",\"is_slashed\":false},{\"account_id\":\"masternode24.pool.f863973.m0\",\"is_slashed\":false},{\"account_id\":\"01node.pool.f863973.m0\",\"is_slashed\":false},{\"account_id\":\"p2p.pool.f863973.m0\",\"is_slashed\":false},{\"account_id\":\"legends.<snip>
  \"latest_block_height\":81641688,\"latest_state_root\":\"4yNrvAWtpEEAzCigEsYLriY4KG9gECDebrUk3b8EBAk1\",\"latest_block_time\":\"2022-02-07T08:02:25.995190071Z\",\"syncing\":false,\"earliest_block_hash\":\"H3nLmP5PPLSCX863ipiMSRZaBAsBKhXUkAsSzuaBJJYJ\",\"earliest_block_height\":81395663,\"earliest_block_time\":\"2022-02-05T08:47:02.279368896Z\"},\"validator_account_id\":null},\"id\":\"dontcare\"}"
}
```

Give the already implemented `view_account` and `tx_status` functions a try or add more methods from the RPC API -- we are looking forward to your pull requests.

### Summary

We created portable Wasm modules to function as an adapter to NEAR's JSON-RPC framework, which can be distributed as hosted services to Rust peer nodes. These services may be used on their own or in conjunction with a specialized peer node, see above, taking care of signing tasks while shielding the secret (wallet) keys from preying eyes. Regardless of the implementation route taken, Aqua allows us to seamlessly compose and reuse our services regardless of the chosen deployment option.
