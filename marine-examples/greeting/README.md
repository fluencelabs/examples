# Greeting

## Overview

This is a very simple service comprised of a single Wasm module, where the module only has one function, greeting. Fundamentally, this example illustrates how to build a function as a service (FaaS) for peer-to-peer deployment, with the exciting purpose of providing a hello world experience.

## Build

To build the example, please run the following command:

```
./build.sh
```

After the build is done, you get the module in the `artifacts` directory:

```
➜  greeting git:(main)  ls artifacts
greeting.wasm
```

## Run

### Local

Test and inspect the example locally using the `mrepl` tool:

```
  greeting git:(main) mrepl Config.toml
Welcome to the Marine REPL (version 0.16.1)
Minimal supported versions
  sdk: 0.6.0
  interface-types: 0.20.0

app service was created with service id = 05251276-81fe-4dad-aea1-f35981077ec1
elapsed time 99.394571ms

1> i
Loaded modules interface:

greeting:
  fn greeting(name: string) -> string

2> call greeting greeting ["Mundo"]
result: String("Hi, Mundo")
 elapsed time: 123.176µs

3> q
➜  greeting git:(main)
```

Alternatively we can use `cargo test`:

```
➜  greeting git:(main) cargo +nightly test --release
 
 ....

    Finished release [optimized] target(s) in 10m 35s
     Running unittests src/main.rs (target/release/deps/greeting-35ba77ac6c6613e5)

running 2 tests
test tests::non_empty_string ... ok
test tests::empty_string ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.14s

➜  greeting git:(main)
```

### Remote

Let's deploy our service first.

We need a target node to deploy to. For that purpose we can leverage the default fluence network:

```
aqua config default_peers
/dns4/kras-00.fluence.dev/tcp/19990/wss/p2p/12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e
/dns4/kras-00.fluence.dev/tcp/19001/wss/p2p/12D3KooWR4cv1a8tv7pps4HH6wePNaK6gf1Hww5wcCMzeWxyNw51
/dns4/kras-01.fluence.dev/tcp/19001/wss/p2p/12D3KooWKnEqMfYo9zvfHmqTLpLdiHXPe4SVqUWcWHDJdFGrSmcA
/dns4/kras-02.fluence.dev/tcp/19001/wss/p2p/12D3KooWHLxVhUQyAuZe6AHMB29P7wkvTNMn7eDMcsqimJYLKREf
/dns4/kras-03.fluence.dev/tcp/19001/wss/p2p/12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE
/dns4/kras-04.fluence.dev/tcp/19001/wss/p2p/12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi
/dns4/kras-05.fluence.dev/tcp/19001/wss/p2p/12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS
/dns4/kras-06.fluence.dev/tcp/19001/wss/p2p/12D3KooWDUszU2NeWyUVjCXhGEt1MoZrhvdmaQQwtZUriuGN1jTr
/dns4/kras-07.fluence.dev/tcp/19001/wss/p2p/12D3KooWEFFCZnar1cUJQ3rMWjvPQg6yMV2aXWs2DkJNSRbduBWn
/dns4/kras-08.fluence.dev/tcp/19001/wss/p2p/12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt
/dns4/kras-09.fluence.dev/tcp/19001/wss/p2p/12D3KooWD7CvsYcpF9HE9CCV9aY3SJ317tkXVykjtZnht2EbzDPm
```

We also need to create keys by issuing the command:

```
aqua key create
{
    "peerId": "<your-created-peer-id>",
    "secretKey": "<your-created-secret-key>",
    "publicKey": "<your-created-public-key>"
}
```

Now we have everything ready for our deployment:

```
aqua remote deploy_service \
     --addr /dns4/kras-01.fluence.dev/tcp/19001/wss/p2p/12D3KooWKnEqMfYo9zvfHmqTLpLdiHXPe4SVqUWcWHDJdFGrSmcA \
     --config-path configs/greeting_deploy_cfg.json \
     --sk <your-created-secret-key> \
     --service greeting
```

Which results in a success message and more importantly, the unique id for the deployed service:

```
Going to upload a module...
2022.06.29 18:16:36 [INFO] created ipfs client to /ip4/178.128.194.190/tcp/5001
(node:16062) ExperimentalWarning: The Fetch API is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
2022.06.29 18:16:36 [INFO] connected to ipfs
2022.06.29 18:16:36 [INFO] file uploaded
Now time to make a blueprint...
Blueprint id:
0912aa1509eb298e19ede0b3788db936c13009c3bade796c836843441654e723
And your service id is:
"ed7c0122-8952-42b7-bd8b-56efa3f62fce"
```

Now we need to call our service. Let's generate an initial stub for our code, and `marine` is a great tool for that:

```
marine aqua artifacts/greeting.wasm > remote-run.aqua
cat remote-run.aqua
module Greeting declares *

service Greeting:
  greeting(name: string) -> string
```

It's our starting point that we need to extend a bit: define the `hello` function that calls our deployed service and [export](https://fluence.dev/docs/aqua-book/language/header/#export) it using an `export`:

```
module Greeting declares *

export hello as my_hello

service Greeting:
  greeting(name: string) -> string


func hello(name: string, node: string, sid: string) -> string:
    on node:
        Greeting sid
        res <- Greeting.greeting(name)
    <- res    
```

Since we've got the code now, let's put it into work:

```
aqua run \
    --addr /dns4/kras-00.fluence.dev/tcp/19990/wss/p2p/12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e \
    --input remote-run.aqua \
    --func 'my_hello("igor", "12D3KooWKnEqMfYo9zvfHmqTLpLdiHXPe4SVqUWcWHDJdFGrSmcA", "ed7c0122-8952-42b7-bd8b-56efa3f62fce")'
"Hi, igor"
```

where

`addr` - is a relay peer;

`input` - our [Aqua code](https://fluence.dev/docs/aqua-book/language/) we run;

`func` - a function call with parameters that initiates compute.

For more detailed and in depth reading on the example please refer to the [Marine Examples Readme](../README.md#greeting-example).