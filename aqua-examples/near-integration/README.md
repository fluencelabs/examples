# NEAR + Fluence + Aqua Integrations

**WIP: Tread With Care**

## Overview

We experiment with both a [Fluence JS](https://github.com/fluencelabs/fluence-js) node based on the [NEAR API JS](https://docs.near.org/docs/api/javascript-library) and [Wasm services] wrapping [NEAR RPC API](https://docs.near.org/docs/api/rpc). A [NEAR CLI](https://docs.near.org/docs/tools/near-cli) integration is planned for the near future.

## Fluence JS NEAR Signing Peer

Signing transaction and messages is a critical operation both on- and off-chain and an integral part of most Web3 workflows. In Fluence's open, permissionless peer-to-peer network maintaining data privacy is a challenge. For example, passing the password for a keyfile or a private key itself is quite risky, even though the communication channel is end-to-end encrypted, as the "end" of the channel is the node hosting the target service. Hence, a node can easily eavesdrop on decrypted traffic and abscond with your password or key and presumably, your funds. Of course, you could run your own node to eliminate the such exploits but that means, well, allocating resources to manage your own node(s) and possibly, Wasm signing services.

A more advantageous solution might be to implement a Fluence Signing Node (FSN) with Fluence JS, which is exactly what we have done for this example. While a Fluence JS peer does not allow for the hosting of arbitrary services at this point, it does allow to easily wrap the NEAR JS SDK an expose whatever interfaces you want to be used/composed with Aqua.

### Signing With Aqua

TDB

Open two terminal windows in the `~/near-examples/near-signing-node/` directories to launch the Signing node and a client peer, respectively. Please note that you can use the Signing node with a local Fluence node or the testnet. For our purposes, we will be using the `krasnodar` testnet. 

```bash
# setup the node
npm i

# compile aqua
npm run compile-aqua

npm run compile-aqua

> near-wallet-node-poc@0.1.0 compile-aqua
> aqua -i aqua/ -o src/_aqua

2021.12.08 11:34:53 [INFO] Aqua Compiler 0.5.0-246
2021.12.08 11:34:53 [INFO] Result /Users/bebo/localdev/examples/near-examples/near-signing-node/src/_aqua/near_signer.ts: compilation OK (3 functions, 1 services)
2021.12.08 11:34:53 [INFO] Result /Users/bebo/localdev/examples/near-examples/near-signing-node/src/_aqua/near_demo.ts: compilation OK (2 functions, 1 services)

# start the node
npm start

> near-wallet-node-poc@0.1.0 start
> node -r ts-node/register src/index.ts

PeerId:  12D3KooWLCaFtoq9uu1jFg38uZXU4fNAkcL5X3xoQu6UqFxRFavU
Relay id:  12D3KooWHBG9oaVx4i3vi6c1rSBUm7MLBmyGmmbHoZ23pmjDCnvK
ctrl-c to exit

```

Please note the relay and peer ids for use in your client calls. For example, we can call the `account_state` method:

```bash
aqua run \
    -i aqua -a "/ip4/127.0.0.1/tcp/9990/ws/p2p/12D3KooWHBG9oaVx4i3vi6c1rSBUm7MLBmyGmmbHoZ23pmjDCnvK"  \
    -f 'account_state("testnet", "boneyard93501.testnet", "12D3KooWLCaFtoq9uu1jFg38uZXU4fNAkcL5X3xoQu6UqFxRFavU", "12D3KooWHBG9oaVx4i3vi6c1rSBUm7MLBmyGmmbHoZ23pmjDCnvK")'
```


## Fluence Wasm NEAR Services

In the `services` directory, you find a minimal Wasm adapter for [NEAR RPC API](https://docs.near.org/docs/api/rpc) to get you started. Since we are connecting to on-chain resources via JSON-RPC, we need our service module to have access to the [cUrl adapter](../near-examples/services/curl-adapter/), which we are enabling with `extern`:

```rust
// src/main.rs
#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(cmd: Vec<String>) -> MountedBinaryResult;
}
```

Since we are implementing a dedicated [signing node](./near-signing-node), we limit our RPC implementation examples to read operations.

### Node Status Wrapper

This function wraps the RPC [`status`](https://docs.near.org/docs/api/rpc/network#node-status) endpoint and requires only one parameter: the `network_id`', e.g., `testnet`. The `node_status` function returns the `Result` type:

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

Assuming you compiled the code with `./scripts/build.sh`, We can interact with the `node_status` in `mrepl`. Open the REPL with `mrepl configs/Config.toml` and:

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

As you can see, this is a straight mapping of the RPC response to the `Result` struct, which we can process in Aqua like so:

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


```

> near-wallet-node-poc@0.1.0 start
> node -r ts-node/register src/index.ts

PeerId:  12D3KooWLCaFtoq9uu1jFg38uZXU4fNAkcL5X3xoQu6UqFxRFavU
Relay id:  12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi
ctrl-c to exit
```





```aqua
aqua run -i aqua -a "/dns4/kras-04.fluence.dev/tcp/19001/wss/p2p/12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi"  -f 'account_state("testnet", "boneyard93501.testnet", "12D3KooWLCaFtoq9uu1jFg38uZXU4fNAkcL5X3xoQu6UqFxRFavU", "12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi")'

```




```
Your peerId: 12D3KooWFb7WYKtWAauDKConv3jJCbWhBZ5YepCSZbDGkzK8aEsJ
[
  {
    "amount": "199999263602996286400000000",
    "block_hash": "782aDyWvKZdj5Kq4YPZenDj1MZP7FHDLb15H2vqkKq1T",
    "block_height": 74253866,
    "code_hash": "11111111111111111111111111111111",
    "locked": "0",
    "storage_paid_at": 0,
    "storage_usage": 674
  }
]
```