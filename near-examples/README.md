# NEAR + Fluence + Aqua Integrations

**WIP**

We experiment with both a [Fluence JS]() node based on the NEAR ??? SDK and [Wasm services] wrapping [NEAR RPC API](https://docs.near.org/docs/api/rpc).  A [NEAR CLI](https://docs.near.org/docs/tools/near-cli) integration is planned for the near future.

## Fluence JS NEAR Signing Peer

Signing transaction and messages is a critical operation both on- and off-chain and an integral part of most Web3 workflows. In Fluence's open, permissionless peer-to-peer network maintaining data privacy is a challenge. For example, passing the password for a keyfile or a private key is quite risky, even though the communication channel is end-to-end encrypted, as the "end" of the channel is the node hosting the target service. Hence, a node can easily eavesdrop on decrypted traffic and abscond with your password or key and presumably, your funds. Of course, you could run your own node to eliminate the such exploits but that means, well, allocating resources to manage your own node(s) and possibly, Wasm signing services.

A slightly more advantageous solution might be to implement a Signing node with Fluence JS, which is exactly what we have done for this example. While a Fluence JS peer does not allow for the hosting of arbitrary services, it does allow to easily wrap the NEAR JS SDK and provide ...

[NEAR API JS](https://docs.near.org/docs/api/javascript-library)


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


This function wraps the RPC [`status`]() call and requires two parameters the `network_id`', e.g., `testnet`, and the `block_ref`, which corresponds to block-ref`, and may be either block hash or block height. The `node_status` function returns the `Result` type:

```rust
// src.main.rs
// <snip>
#[marine]
pub struct Result {
    pub stderr: String,
    pub stdout: String,
}

#[marine]
pub fn node_status(network_id: String, block_ref: String) -> Result {
    // block-ref can be block height or block hash
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
call 
```



This is a very simple implementation mapping the node response to the simple  `Result` struct, which we can process in Aqua lik so:

```aqua

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



 Please note that you can implement a variety of signing solutions over RPC including interactive signing via Metamask, for example.