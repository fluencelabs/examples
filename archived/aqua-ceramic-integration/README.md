# Ceramic Adapter For Fluence And Aqua

**WIP -- Tread with care.**

## Overview

In order to use services available outside the Fluence network, such as [IPFS](https://ipfs.io/) or [Ceramic](https://ceramic.network/), we need to create adapters, which are generally implemented with Wasm modules, that allow us to bridge the Fluence network with many other networks and protocols. Once our adapter services are in place, we can use Aqua to seamlessly integrate such resources into our distributed, peer-to-peer application composition.

![image](assets/figure_1.jpg)

In this example, we develop an adapter for the Ceramic [CLI API](https://developers.ceramic.network/build/cli/api/) with the goal of seamlessly integrating Ceramic services into Fluence peer-to-peer applications composed with Aqua. See Figure 1.

Our adapter service mounts the Ceramic CLI with the [MountedBinaryResult](https://fluence.dev/docs/marine-book/marine-rust-sdk/developing/mounted-binaries) interface requiring the availability of [Ceramic tools](https://developers.ceramic.network/build/cli/installation/) as a sidecar. In addition, a limited Ceramic HTTP API implementation is also available using the Marine [curl adapter](https://fluence.dev/docs/build/tutorials/curl-as-a-service). Since the HTTP API is limited and won't let users create streams, it is offered primarily for educational purposes, although it may be useful in scenarios where a ceramic daemon deployment is not feasible.

**Please note that Ceramic binary access is currently only available at Fluence's `stage` network environment (`aqua config default_peers stage`) with path `/usr/bin/ceramic`.**

ToDos:

- [ ] Refactor CLI adapter for optional built-in deployment
- [ ] Separate HTTP from CLI code
- [ ] Add multimodule tests
- [X] Add use of Aqua demo
- [X] Change fldist to aqua cli

For another, comprehensive, end-to-end implementation of an adapter, see [Aqua IPFS Library](https://fluence.dev/docs/aqua-book/libraries/aqua-ipfs) and [Aqua IPFS demo](https://github.com/fluencelabs/examples/tree/main/aqua-examples/aqua-ipfs-integration).

## Ceramic CLI Adapter Module

You can find the code in the `services/ceramic-adapter-custom/src` directory. Let's have a look at the `ceramic_cli.rs` file. In order for the adapter to work, we need to have the binary, i.e. `ceramic daemon`, available at the host node level, which, in the case of the `stage` network, is at `/usr/bin/ceramic`.

We start with the general Marine setup of our project and at the end of the file we have our linked binary code using Rust's (FFI) [`extern`](https://doc.rust-lang.org/std/keyword.extern.html):

```rust
use marine_rs_sdk::{marine, MountedBinaryResult};

//<snip>

// mount binary with `extern`
#[marine]
#[link(wasm_import_module = "host")]
extern "C" {
    pub fn ceramic(cmd: Vec<String>) -> MountedBinaryResult;
}
```

We now can call the ceramic cli binary at the node level with a simple `ceramic(args)` call. The return of the extern `ceramic` call is [MountedBinaryResult](https://github.com/fluencelabs/marine-rs-sdk/blob/2bd0c63a932756f32423a4815fb2dce485abe67a/src/mounted_binary.rs#L27), which we can use as is or map into a more suitable return type. See the `services/ceramic-adapter` directory for an implementation utilizing the `MountedBinaryResult` struct making it suitable for a lower level library or (optional) built-in use.

For the purpose of ur example, we map the `MountedBinaryResult` into a custom `CeramicResult` with both a `new` and `crate` implementation where the former takes a `MountedBinaryResult` and maps it into `CeramicResult` and the latter creates `CeramicResult` from individual args.

Let's have a look at `create_stream`:

```rust
use marine_rs_sdk::{marine, MountedBinaryResult};

#[marine]
pub struct CeramicResult {
    pub ret_code: i32,
    pub stderr: String,
    pub stdout: String,
}

impl CeramicResult {
    fn new(mb: MountedBinaryResult) -> Self {
        CeramicResult {
            ret_code: mb.ret_code,
            stderr: String::from_utf8(mb.stderr).unwrap(),
            stdout: String::from_utf8(mb.stdout).unwrap(),
        }
    }

    fn create(ret_code: i32, stdout: String, stderr: String) -> Self {
        CeramicResult {
            ret_code,
            stderr,
            stdout,
        }
    }
}

//<snip>

#[marine]
pub fn create_stream(payload: String) -> CeramicResult {
    let args = vec![
        "create".to_string(),
        "tile".to_string(),
        "--content".to_string(),
        payload,
    ];
    let response: MountedBinaryResult = ceramic(args);
    if response.stderr.len() > 0 {
        return CeramicResult::new(response);
    }
    let stdout_str: String = String::from_utf8(response.stdout).unwrap();
    
    // extract StreamId from formatted response code
    if stdout_str.contains("StreamID") {
        let res: Vec<&str> = stdout_str.split("\n").collect();
        let stream_id = res[0].replace("StreamID(", "").replace(")", "");
        return CeramicResult::create(response.ret_code, stream_id.to_string(), "".to_string());
    } else {
        return CeramicResult::create(
            response.ret_code,
            "Missing StreamId".to_string(),
            "".to_string(),
        );
    }
}

//<snip>
```

[Creating a stream](https://developers.ceramic.network/build/cli/quick-start/#2-create-a-stream) with the cli, requires the args `ceramic create tile --content` plus some content, e.g., `'{ "Foo": "Bar" }'`, which returns the StreamId and echoes back the formatted content:

```bash
StreamID(kjzl6cwe1jw147ww5d8pswh1hjh686mut8v1br10dar8l9a3n1wf8z38l0bg8qa)
{
    "Foo": "Bar"
}
```

If we just want to return the StreamId as our `CeramicResult.stdout` value so we can easily access and use it in Aqua, we can clean up the raw response string and extract just the StreamId, which we are doing in the code example above. A more generalized solution would use another service to do that extraction as part of the Aqua workflow. Regardless, in this example, the `create_stream` function returns a `CeramicResult` where `stdout` is the StreamId string, if available. See `ceramic_cli.rs` for the remaining [cli wrappers](https://developers.ceramic.network/build/cli/quick-start/) *show*, *state*, *update*, and *create_schema*.

To build the adapter, run:

```bash
./scripts/build.sh
```

Once the Wasm modules are compiled, we can inspect them with `mrepl`. Make sure you have a local version of [Ceramic CLI](https://developers.ceramic.network/build/cli/installation/#1-install-the-cli) installed and running.

## Interacting With Adapter Locally

With the ceramic daemon running, let's start the REPL:

```bash
mrepl configs/Config.toml
```

Before we checkout our handiwork, let's have a look at the `Config.toml` file:

```toml
modules_dir = "artifacts"   # <-- that's where our Wasm modules are 


[[module]]
name = "curl_adapter"       # <-- for the curl adapter which we need for the http adapter
max_heap_size = "100 KiB"
logger_enabled = true

[module.mounted_binaries]
curl = "/usr/bin/curl"      # <-- path to curl on LOCAL machine


[[module]]
name = "ceramic_adapter_custom"    <-- for the ceramic adapter we are creating
max_heap_size = "50 KiB"
logger_enabled = true

[module.mounted_binaries]
ceramic = "/xxx/yyy/.nvm/versions/node/v14.16.0/bin/ceramic"   # <--replace with your path to ceramic on LOCAL machine
```

In our case, we are using two local binaries, `curl` and `ceramic` and we need the local path for each binary, which you get with `which curl` and `which ceramic`, respectively. **Make sure you update the binary paths with your paths**.

In the REPL, we can now interact with our adapter functions:

```rust
Welcome to the Marine REPL (version 0.9.1)
Minimal supported versions
  sdk: 0.6.0
  interface-types: 0.20.0

app service was created with service id = 06431523-4a89-4ea3-bf4b-2e5a5e6b9a78
elapsed time 100.0461ms

1> i
Loaded modules interface:
data CeramicResult:
  ret_code: i32
  stderr: string
  stdout: string
data MountedBinaryResult:
  ret_code: i32
  error: string
  stdout: []u8
  stderr: []u8

ceramic_adapter_custom:
  fn update(stream_id: string, payload: string) -> CeramicResult
  fn state(stream_id: string) -> CeramicResult
  fn create_stream(payload: string) -> CeramicResult
  fn http_pins(url: string, port: u32) -> string
  fn http_streams(url: string, port: u32, stream_id: string) -> string
  fn http_chain_id(url: string, port: u32) -> string
  fn http_rm_pin(url: string, port: u32, stream_id: string) -> string
  fn http_health(url: string, port: u32) -> string
  fn create_schema(schema: string) -> CeramicResult
  fn show(stream_id: string) -> CeramicResult
  fn http_pin(url: string, port: u32, stream_id: string) -> string
  fn ceramic_request(args: []string) -> CeramicResult
curl_adapter:
  fn curl_request(cmd: []string) -> MountedBinaryResult
```

The `interface` command lists all exposed interfaces and functions corresponding to what we marked public in our Rust code and includes the `http` functions we briefly discussed above. Let's test some functions!

```rust
2> call ceramic_adapter_custom create_stream ["{\"foo\":\"bar\"}"]
result: Object({"ret_code": Number(0), "stderr": String(""), "stdout": String("kjzl6cwe1jw147gy6h9ygbtzzs0pjg4qyhp4bhx69k88h25e95ads7ybc0aa8sx")})
 elapsed time: 1.510019477s

3> call ceramic_adapter_custom update  ["kjzl6cwe1jw147gy6h9ygbtzzs0pjg4qyhp4bhx69k88h25e95ads7ybc0aa8sx","{\"foo\":\"bar closed\"}"]
result: Object({"ret_code": Number(0), "stderr": String(""), "stdout": String("{\n  \"foo\": \"bar closed\"\n}\n")})
 elapsed time: 1.503898936s

4> call ceramic_adapter_custom show  ["kjzl6cwe1jw147gy6h9ygbtzzs0pjg4qyhp4bhx69k88h25e95ads7ybc0aa8sx"]
result: Object({"ret_code": Number(0), "stderr": String(""), "stdout": String("{\n  \"foo\": \"bar closed\"\n}\n")})
 elapsed time: 1.37588522s

5> call ceramic_adapter_custom http_streams  ["127.0.0.1", 7007, "kjzl6cwe1jw147gy6h9ygbtzzs0pjg4qyhp4bhx69k88h25e95ads7ybc0aa8sx"]
result: String("{\"streamId\":\"kjzl6cwe1jw147gy6h9ygbtzzs0pjg4qyhp4bhx69k88h25e95ads7ybc0aa8sx\",\"state\":{\"type\":0,\"content\":{\"foo\":\"bar\"},\"metadata\":{\"unique\":\"53BLyT4m2wXSim4y\",\"controllers\":[\"did:key:z6Mkupzc4V3f7RiQCzjxVqqqRXbkmuAdN38oPqATcyWq2HaN\"]},\"signature\":2,\"anchorStatus\":\"PENDING\",\"log\":[{\"cid\":\"bagcqceralapnmkp2h5ok5mdzg6sbusonrpkuo6r2jg67ga5vd3jbzyjhcuiq\",\"type\":0},{\"cid\":\"bagcqceratnh7647bpprjja6pmn6eaeapi2agqxyzdp2lvu2stradj5u7sima\",\"type\":1},{\"cid\":\"bagcqceratxvtlnupnt3cjsr7eob6osksdoatkmlzoyvs3plpitvza2vp244a\",\"type\":1}],\"anchorScheduledFor\":\"2021-10-20T18:00:00.000Z\",\"next\":{\"content\":{\"foo\":\"bar closed\"},\"metadata\":{\"unique\":\"53BLyT4m2wXSim4y\",\"controllers\":[\"did:key:z6Mkupzc4V3f7RiQCzjxVqqqRXbkmuAdN38oPqATcyWq2HaN\"]}},\"doctype\":\"tile\"}}")
 elapsed time: 280.67577ms

6>
```

In (2) we call the create stream function and get back the StreamId in the `stdout` key. Copy the SteamId and past it into the `update` command along with new content (3) and then in the `show` command in (4) to verify that our update was successful. In (5) we use one fo the http calls to `show`, also with the above StreamId and the *localhost* and *7007* host and port params, respectively. Notice the much more verbose output. Since we are using the (default) Ceramic testnet, you can see that the anchoring of our stream `"anchorStatus\":\"PENDING\"` is still pending. Give it a few shakes, re-run the command and you should see a block confirmation instead:

```rust
6> call ceramic_adapter_custom http_streams  ["127.0.0.1", 7007, "kjzl6cwe1jw147gy6h9ygbtzzs0pjg4qyhp4bhx69k88h25e95ads7ybc0aa8sx"]
result: String("{\"streamId\":\"kjzl6cwe1jw147gy6h9ygbtzzs0pjg4qyhp4bhx69k88h25e95ads7ybc0aa8sx\",\"state\":{\"type\":0,\"content\":{\"foo\":\"bar closed\"},\"metadata\":{\"unique\":\"53BLyT4m2wXSim4y\",\"controllers\":[\"did:key:z6Mkupzc4V3f7RiQCzjxVqqqRXbkmuAdN38oPqATcyWq2HaN\"]},\"signature\":2,\"anchorStatus\":\"ANCHORED\",\"log\":[{\"cid\":\"bagcqceralapnmkp2h5ok5mdzg6sbusonrpkuo6r2jg67ga5vd3jbzyjhcuiq\",\"type\":0},{\"cid\":\"bagcqceratnh7647bpprjja6pmn6eaeapi2agqxyzdp2lvu2stradj5u7sima\",\"type\":1},{\"cid\":\"bagcqceratxvtlnupnt3cjsr7eob6osksdoatkmlzoyvs3plpitvza2vp244a\",\"type\":1},{\"cid\":\"bafyreifqb3qxuc7pgb7yi67z2b7v5tq62a3nwtr2em5bwl4dmw6yprdnbu\",\"type\":2,\"timestamp\":1634752889}],\"anchorProof\":{\"root\":\"bafyreie3a5rnztmxxjpwpxhatvlfgkv3mp3hdyrfpdwhwzfgwff6snwofi\",\"txHash\":\"bagjqcgzam3yccif57fc6otuo7qtda6d5hkm3wig5ghdjbwjosvogyher5q3q\",\"chainId\":\"eip155:3\",\"blockNumber\":11266361,\"blockTimestamp\":1634752889},\"doctype\":\"tile\"}}")
 elapsed time: 20.946101ms
```

That is, `...\"chainId\":\"eip155:3\",\"blockNumber\":11266361,\"blockTimestamp\":1634752889}, ...` contains the chain confirmation reference and is readily viewable on [etherscan](https://ropsten.etherscan.io/block/11266361).

Looks like our services are working and ready for deployment to the `stage` network. We use the `aqua` command line tool to do so:

```bash
aqua remote deploy_service \
     --addr /dns4/stage.fluence.dev/tcp/19004/wss/p2p/12D3KooWJ4bTHirdTFNZpCS72TAzwtdmavTBkkEXtzo6wHL25CtE \
     --config-path configs/ceramic_adapter_deploy_cfg.json \
     --service ceramic-service \
     --sk <your secret key>
```

Which gives us our service id:

```bash
Going to upload a module...
2022.04.29 12:03:55 [ERROR] created ipfs client to /ip4/134.209.186.43/tcp/5004
2022.04.29 12:03:55 [ERROR] connected to ipfs
2022.04.29 12:03:55 [ERROR] file uploaded
Going to upload a module...
2022.04.29 12:03:57 [ERROR] created ipfs client to /ip4/134.209.186.43/tcp/5004
2022.04.29 12:03:57 [ERROR] connected to ipfs
2022.04.29 12:03:57 [ERROR] file uploaded
Now time to make a blueprint...
Blueprint id:
9eda8608af7fdb304b1cbbdd875df3a5a08616bbe9847e74454e1b217c7b4fd4
And your service id is:
"e9fbfb09-c8b8-447a-b405-5de579b8db6c" # <-- this is different for you
```

With our modules deployed and linked into service `e9fbfb09-c8b8-447a-b405-5de579b8db6c`, we are now ready to utilize Ceramic streams from the Fluence network with Aqua.

## Using the Ceramic Adapter With Aqua

Now that we have our Ceramic adapter serivce deployed to the Fluence `stage` network, we can use Aqua to make the Ceramic streams functionality available by composition. Let's create a demo Aqua script to illustrate the use. See the `ceramic_demo.aqua` file in the `aqua` directory:

```aqua
data CeramicResult:
  ret_code: i32
  stderr: string
  stdout: string

service CeramicAdapter("service-id"):
  ceramic_request(args: []string) -> CeramicResult
  create_schema(schema: string) -> CeramicResult
  create_stream(payload: string) -> CeramicResult
  show(stream_id: string) -> CeramicResult
  state(stream_id: string) -> CeramicResult
  update(stream_id: string, payload: string) -> CeramicResult

-- aqua function to create stream and return stream id
func create(payload:string, node:string, service_id:string) -> string:
    on node:
        CeramicAdapter service_id
        create_res <- CeramicAdapter.create_stream(payload)
    <- create_res.stdout

-- aqua function to create stream and return CeramicResult
func create_obj(payload:string, node:string, service_id:string) -> CeramicResult:
    on node:
        CeramicAdapter service_id
        create_res <- CeramicAdapter.create_stream(payload)
    <- create_res

-- aqua function to create stream, show, update and return stream id, show and update as stdout strings
func roundtrip(payload:string, payload_two: string, node:string, service_id:string) -> string, string, string:
    on node:
        CeramicAdapter service_id
        create_res <- CeramicAdapter.create_stream(payload)                      --< return the stream_id in stdout
        show_res <- CeramicAdapter.show(create_res.stdout)                       --< 
        update_res <- CeramicAdapter.update(create_res.stdout, payload_two)
    <- create_res.stdout, show_res.stdout, update_res.stdout
```

We created three Aqua demo functions and used marine to export all interfaces to our aqua file before we added our code with `marine aqua artifacts/ceramic_adapter_custom.wasm >> aqua/ceramic_demo.aqua`.:

- `func create(payload:string, node:string, service_id:string) -> string:` shows how to create a stream and return only the StreamId as a string
- `func create_obj(payload:string, node:string, service_id:string) -> CeramicResult:` shows how to create a stream and return the `CeramicResult` struct
- `func roundtrip(payload:string, payload_two: string, node:string, service_id:string) -> string, string, string:
    on node:` show how to create and update a stream, save intermittent results and return the triple (stream_id, show result before update, show result after update) 



We continue to use `aqua` cli to run our Aqua scripts.  First, let's run our simple `create` which returns the StreamId as a string:

```bash
aqua run -i aqua \
   --addr /dns4/stage.fluence.dev/tcp/19004/wss/p2p/12D3KooWJ4bTHirdTFNZpCS72TAzwtdmavTBkkEXtzo6wHL25CtE \
    -f'create(arg, "12D3KooWJ4bTHirdTFNZpCS72TAzwtdmavTBkkEXtzo6wHL25CtE", "e9fbfb09-c8b8-447a-b405-5de579b8db6c")' \
    -d '{"arg": "{\"foo\":\"bar\"}"
    }'
```

Returns:

```bash
Your peerId: 12D3KooWKgpdZo2xVDYQ9MPqT3tMQwgo2zWQFWNtVPYWyhLN5kK5
"kjzl6cwe1jw145d1ks7ubujk6hxc8em4n3z65may2mc9b321wep8hci0eprrpo3"
```

Now, we run the same functionality but with the `CeramicResult` as the return value:

```bash
aqua run -i aqua \
   --addr /dns4/stage.fluence.dev/tcp/19004/wss/p2p/12D3KooWJ4bTHirdTFNZpCS72TAzwtdmavTBkkEXtzo6wHL25CtE \
    -f'create_obj(arg, "12D3KooWJ4bTHirdTFNZpCS72TAzwtdmavTBkkEXtzo6wHL25CtE", "e9fbfb09-c8b8-447a-b405-5de579b8db6c")' \
    -d '{"arg": "{\"foo\":\"bar\"}"
    }'
```

Which returns the `CeramicResult` object:

```bash
Your peerId: 12D3KooWLsy44ycUSiQzEDX9PNZW3XEpLmAcLMaKxCZHqJKhu2Uc
{
  "ret_code": 0,
  "stderr": "",
  "stdout": "kjzl6cwe1jw1485qhhhjzpua7cc7xq03qqi2z0w93e12qc1w8sob78o2pebdvef"
}
```

This allows us to access members with the dot notation, e.g, CeramicResultObj.stderr. Finally, we run our roundtrip function where we create, update and show:

```bash
aqua run -i aqua \
   --addr /dns4/stage.fluence.dev/tcp/19004/wss/p2p/12D3KooWJ4bTHirdTFNZpCS72TAzwtdmavTBkkEXtzo6wHL25CtE \
    -f'roundtrip(arg, arg_2, "12D3KooWJ4bTHirdTFNZpCS72TAzwtdmavTBkkEXtzo6wHL25CtE", "e9fbfb09-c8b8-447a-b405-5de579b8db6c")' \
    -d '{"arg": "{\"foo\":\"bar open\"}", "arg_2":"{\"foo\":\"bar closed\"}"}'
```

Which returns the triple:

```bash
Your peerId: 12D3KooWDvsgbe7MByxPkCwLU96kLcaq3Fyyc15w8SpZf6ELwtAW
[
"kjzl6cwe1jw149tb39f0fe8bmig9kfi49ih2wuf09eslamxb4hckwgrfk2ivox9",
"{\n  \"foo\": \"bar open\"\n}\n",
"{\n  \"foo\": \"bar closed\"\n}\n"
]
```

## Summary

We created a distributed adapter service allowing us not only to bring decentralized store to Fluence's decentralized compute but also to seamlessly integrate that functionality into any composition with Aqua. We further demonstrated the use of Ceramic with Aqua. While the project is still work in progress, feel free to use and share any issues or improvement requests in *Issues*.

