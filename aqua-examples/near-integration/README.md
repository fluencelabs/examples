# NEAR + Fluence + Aqua Integrations
## Overview

We provide integration examples for both a [Fluence JS](https://github.com/fluencelabs/fluence-js) peer based on the [NEAR API JS](https://docs.near.org/docs/api/javascript-library) and distributed [Wasm services](https://github.com/fluencelabs/marine) wrapping the [NEAR RPC API](https://docs.near.org/api/rpc/introduction). A [NEAR CLI](https://docs.near.org/docs/tools/near-cli) integration is planned for the near future.

In our examples we've been using the [Aqua CLI](https://fluence.dev/docs/aqua-book/aqua-cli/) `aqua` and [Marine tooling](https://fluence.dev/docs/marine-book/marine-tooling-reference/) (the [Marine REPL](https://fluence.dev/docs/marine-book/marine-tooling-reference/marine-repl) `mrepl` and [Marine CLI](https://fluence.dev/docs/marine-book/marine-tooling-reference/marine-cli) `marine`).

For the purpose of this tutorial, we'll be using Fluence's new `fluence` CLI tool, which wraps the CLIs you have already been using, e.g., the `aqua` CLI and Marine tooling CLIs (`marine` and `mrepl`), and brings additional features such as project template generation, wrapper generation for deployed services, project dependencies install. See the [Fluence CLI docs](https://github.com/fluencelabs/fluence-cli#readme) for more information.

## Prerequisites

Please make sure you have the latest Fluence CLI installed by running the following command:

```bash
npm install -g @fluencelabs/cli
```

## Fluence JS NEAR Signing Peer

Signing transactions and messages is a critical operation both on- and off-chain and an integral part of most Web3 workflows. In Fluence's open, permissionless peer-to-peer network maintaining data privacy is a challenge. For example, passing the password for a keyfile or the private key itself is quite risky: while a peer-to-peer communication channel is end-to-end encrypted, the "end" of the channel is the node hosting the target service. Hence, a node can easily eavesdrop on decrypted traffic and abscond with your password or key and presumably, your funds. Of course, you can run your own node to eliminate such exploits. Rather than run a full-fledged Rust node for a limited scope requirement, a more advantageous solution might be to implement a Fluence Signing Node (FSN) with Node JS and Fluence JS, which is exactly what we have done for this example. While a Fluence JS peer does not allow for the hosting of arbitrary services at this point, it does allow to easily wrap the NEAR JS SDK and expose whatever interfaces you want to be used/composed with Aqua.


### Implementing a Peer Node With Fluence JS and Aqua

As discussed in the [documentation](https://fluence.dev/docs/build/fluence-js/run-in-node), we can use [Fluence JS](https://github.com/fluencelabs/fluence-js) in a Node JS application resulting in a viable peer node of the Fluence p2p network. If you haven't, have a look at the documentation before you continue. To follow along the code below:

```bash
cd near-signing-node
```

In order to create our signing node, we wrap the [NEAR JS SDK](https://docs.near.org/docs/api/javascript-library) and, for a minimally viable experiment, expose the [sendMoney](https://near.github.io/near-api-js/classes/account_multisig.Account2FA#sendmoney) and a couple non-signing functions.

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

Once we compile Aqua with the `npm run compile aqua` command, which writes the Typescript output into the `/src/_aqua` dir, we can then use the generated code, see `src/_aqua/near_signing_node.ts`, to implement our `sendMoney` service and any of the other interfaces specified in Fluence JS, which essentially follows the [NEAR example](https://docs.near.org/docs/api/naj-quick-reference#send-tokens):

```typescript
// index.ts
async send_money(network_id: string, account_id: string, receiver_id: string, amount: string, password: string): Promise<any> {
        if (!this.password_checker(password)) {
            return Promise.resolve("Not Authorized")
        }
        const config = get_config(network_id, this._keyStore);
        const near = await network_connect(config);
        let account = await near.account(account_id);
        let tx_receipt = await account.sendMoney(receiver_id, amount);
        let result = Promise.resolve(tx_receipt);
        return result;
    }
```

We implement the `send_money` method for the `class NearSigner implements NearSignerApiDef` class, where `NearSignerApiDef` is generated code from the Aqua compilation and which we register (as an exposed service) in `async main` like so:

```typescript
// index.ts
async function main() {
    // ...
    registerNearSignerApi("near", new NearSigner());
    // ...
```

For the complete implementation details, see `src/index.ts`. Before we test our code, please note that in this implementation the wallet credentials are presumed to be in the `~/.near-credentials` directory of the machine/system that runs the Fluence Signing Node.

For *testnet* wallets, see https://wallet.testnet.near.org/ and https://docs.near.org/docs/develop/basics/create-account, to get started.

If you haven't setup Near locally, go to the [Near documentation](https://docs.near.org/tools/near-cli), install the `near` CLI as described in [its github repo](https://github.com/near/near-cli):

```
npm install -g near-cli
```

Login using the `near` CLI with the following command:

```
near login
```

You'll get the output:

```
Please authorize at least one account at the URL above.

Which account did you authorize for use with NEAR CLI?
Enter it here (if not redirected automatically):
Logged in as [ <near-account>.testnet ] with public key [ ed25519:<your-key... ] successfully
```

Upon a successful login you should have a [local credentials](https://docs.near.org/tools/near-cli#access-key-location):

```
ls ~/.near-credentials/testnet
<near-account>.testnet.json
```

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
> fluence aqua -i aqua/ -o src/_aqua

Compiling
... done
2022.08.12 14:11:24:024 main INFO aqua.AquaCli.main:133
    Aqua Compiler 0.7.4-332
Result <path-to-examples>/aqua-examples/near-integration/near-signing-node/src/_aqua/near_signing_node.ts: compilation OK (4 functions, 2 services)
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

PeerId:  12D3KooWRfvdqfDXw4yLnYLpHLrMm56M3G1nAbti4fDdEhgr5gp2
Relay id:  12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi
ctrl-c to exit
```

Please take note of the **relay id** and **peer id** for use in your client peer. In order to call the `account_state` method, open a new terminal window and navigate to the `~/examples/aqua-examples/near-integration/near-signing-node` directory and execute:

```bash
fluence run \
    -i aqua -f 'account_state("testnet", "<near-account>", "lame_password", "<your-peer-id>", "<your-relay-id>")'
```

*Replace* `<near-account>` with your Near testnet account and `<your-peer-id>` and `<your-relay-id>` with the values provided by your peer output as discussed above. Once you've done that, the output should be similar to:

```bash
Running:
  function: account_state("testnet", "<near-account>", "lame_password", "12D3KooWRfvdqfDXw4yLnYLpHLrMm56M3G1nAbti4fDdEhgr5gp2", "12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi")
  relay: /dns4/kras-06.fluence.dev/tcp/19001/wss/p2p/12D3KooWDUszU2NeWyUVjCXhGEt1MoZrhvdmaQQwtZUriuGN1jTr
... done

Result:

{
  "amount": "199999827797124999999980000",
  "block_hash": "6MKaFMkDMqcZrG8toTdAhoqLXrxMJL1JmHWQDnshcstF",
  "block_height": 97232435,
  "code_hash": "11111111111111111111111111111111",
  "locked": "0",
  "storage_paid_at": 0,
  "storage_usage": 346
}
```

In the output above listed the called function (`account_state`) with its arguments as well as the relay used for the call. So, you can observe the context of the function call. And there's a result of the call, of course. In our case it displays [the basic information](https://docs.near.org/tools/near-api-js/account#state) for our Near account described in [AccountView Interface](https://near.github.io/near-api-js/interfaces/providers_provider.AccountView).

Similarly, we can call our `send_money` service with Aqua:

```sh
fluence run \
    -i aqua \
    -f 'send_money("testnet", "<near-from-account>", "<near-to-account>", "10000", "lame_password", "<your-peer-id>", "<your-relay-id>")'
```

Replace the `near-from-account` and `near-to-account` account placeholders with your respective testnet wallets and the `your-peer-id` and `your-relay-id` with the values provided by your peer. Executing above Aqua statement produces a transaction receipt similar to the one below:

```bash
Running:
  function: send_money("testnet", "<near-from-account>", "<near-to-account>", "10000", "lame_password", "12D3KooWRfvdqfDXw4yLnYLpHLrMm56M3G1nAbti4fDdEhgr5gp2", "12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi")
  relay: /dns4/kras-03.fluence.dev/tcp/19001/wss/p2p/12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE
... done

Result:

{
  "receipts_outcome": [
    {
      "block_hash": "EzB5BiTVyqzJjqbTzRRKfQ2qWdj48F5vArVwtdwDmNaG",
      "id": "FmhBQNgwtvaJUxTEbPhqfsUSjuwjcYw4iLsb1LLsKDDH",
      "outcome": {
        "executor_id": "<near-to-account>",
        "gas_burnt": 223182562500,
        "logs": [],
        "metadata": {
          "gas_profile": [],
          "version": 1
        },
        "receipt_ids": [
          "9Q5mKcBgnoN1cM47nfwBRiN6vUoZa4vPhn6boyXZitNd"
        ],
        "status": {
          "SuccessValue": ""
        },
        "tokens_burnt": "22318256250000000000"
      },
      "proof": [
        {
          "direction": "Left",
          "hash": "EA96udAi8vcAdLHnbKPHTW4qKHnMXhJ4zjD4csETYk9r"
        },
        {
          "direction": "Right",
          "hash": "CNtBo5A3Sma7RrK2J9ntTq7p3v7fxS8zYmdXYWDCfscT"
        }
      ]
    },
    {
      "block_hash": "4WX1AZ9VSJDzjv1j6uHqNcz4W7iqz6XyiCqj7wpGn6h1",
      "id": "9Q5mKcBgnoN1cM47nfwBRiN6vUoZa4vPhn6boyXZitNd",
      "outcome": {
        "executor_id": "<near-from-account>",
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
      "proof": []
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
    "hash": "2cCxw5RGTqD9UCwqth3Pe3FhRcYkqRimnzyhYWCBKjjA",
    "nonce": 96699860000005,
    "public_key": "ed25519:82CcWWRM9scav5hbqUVL4JZsBwagqFvjZrLDbaoiE9pr",
    "receiver_id": "<near-to-account>",
    "signature": "ed25519:2cmhrzp4PeKPcXE1vUW89krdTcdsApY3h6TT7CshWdrZMBLUjfJQF6pijzYcFUhpwArNQwDmD9GkVep9gYJTb4Hd",
    "signer_id": "<near-from-account>"
  },
  "transaction_outcome": {
    "block_hash": "DhS6KZzK9PdCqot2k4hewfAWkc7nQ9mnZM91XKZdVRkQ",
    "id": "2cCxw5RGTqD9UCwqth3Pe3FhRcYkqRimnzyhYWCBKjjA",
    "outcome": {
      "executor_id": "<near-from-account>",
      "gas_burnt": 223182562500,
      "logs": [],
      "metadata": {
        "gas_profile": null,
        "version": 1
      },
      "receipt_ids": [
        "FmhBQNgwtvaJUxTEbPhqfsUSjuwjcYw4iLsb1LLsKDDH"
      ],
      "status": {
        "SuccessReceiptId": "FmhBQNgwtvaJUxTEbPhqfsUSjuwjcYw4iLsb1LLsKDDH"
      },
      "tokens_burnt": "22318256250000000000"
    },
    "proof": []
  }
}
```

It's rather convenient to call the `account_state` and `send_money` functions. However, there's still a couple of things we need to remember and use such as `<your-peer-id>` and `<your-relay-id>`. As a matter of fact we can simplify a method call, and `--json-service` param of the `fluence` CLI comes in handy.

Upon the Near signing node start, it creates a JSON file with its peer id and relay id information we can use with the `fluence` CLI and in our Aqua code.

The `js-services.json` looks like:

```json
{
  "name": "JsService",
  "serviceId": "JsService",
  "functions": [
    {
      "name": "get",
      "result": {
        "peerId": "12D3KooWRfvdqfDXw4yLnYLpHLrMm56M3G1nAbti4fDdEhgr5gp2",
        "relayPeerId": "12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi"
      }
    }
  ]
}
```

And the corresponding Aqua code for `transfer_money` looks slightly different: instead of using the function signature to pass the `node` and `relay` arguments, we're now injecting the values with `JsService.get()` into the function body:

```aqua
-- near_signing_node.aqua
func transfer_money(network_id:string, account_id:string, receiver_id:string, amount:string, password: string) -> string:
    services <- JsService.get()  -- step 1
    on services.peerId via services.relayPeerId: -- step 2
        res <- NearSignerApi.send_money(network_id, account_id, receiver_id, amount, password) -- step 3
    <- res
```

On the step 1 using the defined function `get()` of the `JsService` service we get the information about our service (its peer id and relay id) which is wrapped in the `Services` data structure. On step 2 we specify, that the next block should be executed on our JS peer with the id we got on the 1st step (so we extract it using `services.peerId`) which we connect to thru a relay with the `services.relayPeerId` relay id. On the 3rd step we call the Near API service wrapper using `NearSignerApi.send_money` to call the corresponding NEAR API function `sendMoney`.

Those parameters values we injected in the function body are available thru the `js-services.json` and the following definitions in our Aqua code:

```aqua
-- near_signing_node.aqua
data Services:
    peerId: string
    relayPeerId: string

service JsService("JsService"):
    get: -> Services
```

Considering all the above, the `transfer_money` call looks like:

```bash
fluence run \
    -i aqua \
    -f 'transfer_money("testnet", "<near-from-account>", "<near-to-account>", "10000", "lame_password")' --json-service js-services.json
```

The similar approach can be used for the `account_state` with its updated implementation `account_state_view`:

```aqua
-- near_signing_node.aqua
func account_state_view(network_id:string, account_id:string, password: string) -> string:
    services <- JsService.get()
    on services.peerId via services.relayPeerId:
        res <- NearSignerApi.account_state(network_id, account_id, password)
    <- res
```

And we can call the `account_state_view` in a similar fashion as we've done for the `transfer_money`:

```bash
fluence run \
  -i aqua \
  -f 'account_state_view("testnet", "<near-account>", "lame_password")' --json-service js-services.json
```

You can use the [Testnet Explorer](https://explorer.near.org/) to further investigate the token transfer you executed.

### Summary

In this section, we implemented a basic Fluence peer that outlines an approach to shield our NEAR wallet keys from other network participants and to implement singing related functionality, such as the `transfer_money` token transfer method. Additional methods, such as the more generic `sign transaction` and `deploy contract` can be easily implemented this way and we are looking forward to your pull requests. Also note, that our simple string return can be vastly improved by adding the appropriate *interfaces*.

In the next section, we briefly discuss how a variety of NEAR methods can be implemented as distributed, hosted services for easy deployment, re-use and scalability.

## Fluence Wasm NEAR Services

Operating your own node may not always be desireable for a variety of reasons ranging from costs to reuse to scalability and failover requirements. A core feature of the Fluence peer-to-peer network paradigm, of course, is the deployment of Wasm services to essentially any peer, given some hosting agreement, which allows for high portability as well as easy reuse and scalability as a "deploy and forget", low cost solution.  Even if the operation of a node is deemed necessary, as outlined in our Signing Node example above, it still may make sense to split services into a self-operated peer for signing-related activities and some hosted Wasm services otherwise. Of course, Aqua allows you to seamlessly compose any one of the (exposed) services regardless of the deployment approach.

In order to create a NEAR Wasm adapter, we wrap whatever functionality we need from the [NEAR RPC API](https://docs.near.org/api/rpc/introduction) in our Wasm module(s).

### Creating And Deploying NEAR Wasm Services

In the `services/near-adapter/modules` directory, you find a minimal WASM adapter `near-rpc-services` for [NEAR RPC API](https://docs.near.org/api/rpc/introduction) to get you started. Since we are connecting to on-chain resources via JSON-RPC, we need our service module to have access to [cUrl](https://fluence.dev/docs/build/tutorials/curl-as-a-service), which we provide with the [cUrl adapter](../near-integration/services/near-adapter/modules/curl-adapter/):

```rust
// src/main.rs
#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(cmd: Vec<String>) -> MountedBinaryResult;
}
```

Let's have a look at the implementation of the [`network status`](https://docs.near.org/api/rpc/network#node-status) method, which provides a fairly extensive snapshot of the network at the time in inquiry. Our adapter, or wrapper, implementation needs to envelope the RPC [`status`](https://docs.near.org/api/rpc/network#node-status) endpoint and requires only one parameter: the `network_id`', e.g., `testnet`:

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

We can interact with the `node_status` in REPL. Please make sure you are in the `near-integration/services` directory. Open the REPL with `fluence service repl nearAdapter` and get the following output:

```bash
fluence service repl nearAdapter
Making sure service and modules are downloaded and built... done
Welcome to the Marine REPL (version 0.18.0)
Minimal supported versions
  sdk: 0.6.0
  interface-types: 0.20.0

app service was created with service id = e5ae9c3e-60f8-4ae7-b434-6f8085246c1d
elapsed time 326.464043ms

1> call near_rpc_services node_status ["testnet"]
result: Object({"stderr": String(""), "stdout": String("{\"jsonrpc\":\"2.0\",\"result\":{\"chain_id\":\"testnet\",\"latest_protocol_version\":55,\"protocol_version\":54,\"rpc_addr\":\"0.0.0.0:4040\",\"sync_info\":{\"earliest_block_hash\":\"87rXaRN96eVGijmoxXMvKm9XAas1RedpHgh5ifaMfQne\",\"earliest_block_height\":96939089,\"earliest_block_time\":\"2022-08-07T05:20:29.139629926Z\",\"epoch_id\":\"9fvV3KdWb71CtFj6shiFrAgBfq4Zqk16reWBXSGRhgZy\",\"epoch_start_height\":97111890,\"latest_block_hash\":\"Dn6Q8cPogGmGj3m15t2e1c6hgbrBpmd8yrjegX5GU2Nb\",\"latest_block_height\":97136216,\"latest_block_time\":\"2022-08-09T10:12:28.971640387Z\",\"latest_state_root\":\"HBRDv6dEYwv1WEiwTDwPHzXBLmFG5c19YVqHGADH5gM7\",\"syncing\":false},\"validator_account_id\":null,\"validators\":[{\"account_id\":\"legends.pool.f863973.m0\",\"is_slashed\":false},
...
...
...
{\"account_id\":\"kuutamo.pool.f863973.m0\",\"is_slashed\":false},{\"account_id\":\"gargoyle.pool.f863973.m0\",\"is_slashed\":false}],\"version\":{\"build\":\"crates-0.14.0-148-g5228fb106\",\"rustc_version\":\"1.61.0\",\"version\":\"1.28.0-rc.3\"}},\"id\":\"dontcare\"}")})
 elapsed time: 539.529855ms

2>
...
```

As you can see, this is a straight mapping of the RPC response to the `Result` struct introduced above, which we can process in Aqua like so:

```aqua
-- some example aqua file
data Result:
    stderr: string
    stdout: string

service NearRpcServices:
    node_status(network_id: string) -> Result

func rpc_foo(network_id: string, node: string, service_id: string) -> string: 
    on node:
        NearRpcServices service_id
        res <- NearRpcServices.node_status(network_id)
        if res.stderr:
            result <<- "call failed"
        else:
            result <<- res.stdout
        <- result
```

Before we can use our Fluence NEAR adapter, we need to deploy our Wasm modules to one or more host peers. We can do that with [Fluence CLI](https://github.com/fluencelabs/fluence-cli#fluence-deploy):

```bash
fluence deploy
```

The `fluence` CLI will make sure that all required services and modules are in place, can be either downloaded or built. It gives us the deployment confirmation:

```bash
Making sure all services are downloaded... done
Making sure all modules are downloaded and built... done

Going to deploy services described in <path-to-examples>/examples/aqua-examples/near-integration/services/fluence.yaml:

nearAdapter:
  get: ./near-adapter
  deploy:
    - deployId: default


? Do you want to deploy all of these services? Yes
Deploying:
  service: nearAdapter
  deployId: default
  on: 12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS
... done
Compiling <path-to-examples>/examples/aqua-examples/near-integration/services/.fluence/aqua/deployed.app.aqua... done

Currently deployed services listed in <path-to-examples>/examples/aqua-examples/near-integration/services/.fluence/app.yaml:

nearAdapter:
  default:
    - blueprintId: ef2c354407c29317657c47403630a0217601934f4ceda58b7642ef8985a983df
      serviceId: 5bc6970c-1f7a-4e24-bc93-519dd4c40daf
      peerId: 12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS

```

Please note the helper generated in Aqua by the CLI in the `.fluence/aqua/deployed.app.aqua` file for future use in our Aqua. Let's have a look at our Aqua script in `./src/aqua/main.aqua`:

```aqua
-- aqua/main.aqua
func node_report(network_id: string) -> Result:
    services <- App.services()
    on services.nearAdapter.default!.peerId:
        NearRpcServices services.nearAdapter.default!.serviceId
        res <- NearRpcServices.node_status(network_id)
    <- res
```

Which we can run with the `fluence` CLI:

```bash
fluence run -f 'node_report("testnet")'
```

Which results in the following output:

```bash
Running:
  function: node_report("testnet")
  relay: /dns4/kras-02.fluence.dev/tcp/19001/wss/p2p/12D3KooWHLxVhUQyAuZe6AHMB29P7wkvTNMn7eDMcsqimJYLKREf
... done

Result:

{
  "stderr": "",
  "stdout": "{\"jsonrpc\":\"2.0\",\"result\":{\"chain_id\":\"testnet\",\"latest_protocol_version\":55,\"protocol_version\":54,\"rpc_addr\":\"0.0.0.0:4040\",\"sync_info\":{\"earliest_block_hash\":\"87rXaRN96eVGijmoxXMvKm9XAas1RedpHgh5ifaMfQne\",\"earliest_block_height\":96939089,\"earliest_block_time\":\"2022-08-07T05:20:29.139629926Z\",\"epoch_id\":\"9fvV3KdWb71CtFj6shiFrAgBfq4Zqk16reWBXSGRhgZy\",\"epoch_start_height\":97111890,\"latest_block_hash\":\"2DcwXKkZf175VExkDpryH73p99rHQjdu54u4Y5vfambK\",\"latest_block_height\":97136905,\"latest_block_time\":\"2022-08-09T10:30:51.592058687Z\",\"latest_state_root\":\"AmXivm3DbmRqU9fYQe6tDuC3ujz2UbdeYNeLmSRrxzsZ\",\"syncing\":false},\"validator_account_id\":null,\"validators\":[{\"account_id\":\"legends.pool.f863973.m0\",\"is_slashed\":false},
  ...
  ...
  ...
  {\"account_id\":\"stakingfacilities.pool.f863973.m0\",\"is_slashed\":false},{\"account_id\":\"kuutamo.pool.f863973.m0\",\"is_slashed\":false},{\"account_id\":\"gargoyle.pool.f863973.m0\",\"is_slashed\":false}],\"version\":{\"build\":\"crates-0.14.0-148-g5228fb106\",\"rustc_version\":\"1.61.0\",\"version\":\"1.28.0-rc.3\"}},\"id\":\"dontcare\"}"
}

```

Give the already implemented `view_account_report` and `tx_status_report` functions a try or add more methods from the RPC API -- we are looking forward to your pull requests.

### Summary

We created portable Wasm modules to function as an adapter to NEAR's JSON-RPC framework, which can be distributed as hosted services to Rust peer nodes. These services may be used on their own or in conjunction with a specialized peer node, see above, taking care of signing tasks while shielding the secret (wallet) keys from preying eyes. Regardless of the implementation route taken, Aqua allows us to seamlessly compose and reuse our services regardless of the chosen deployment option.
