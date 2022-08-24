# Timestamp Oracle PoC

## Overview

Getting accurate timestamps can be problematic in various contexts including blockchains. Timestamp oracles can alleviate this concern by aggregating and processing a variety of timestamp sources into a point- or range-estimate. Of course, the acquisition of accurate timestamps not subject to manipulation is a critical attribute of a good oracle.  The Fluence peer-to-peer network offers a large number of independent nodes that can serve as timestamp sources from either Kademilia or TrustGraph neighborhoods.

**Note: The timestamps are currently** **not** **signed by the nodes. But that could be easily addressed.**

For this tutorial, we'll be using Fluence's new `fluence` CLI tool, which wraps the CLIs you have already been using, e.g., the `aqua` CLI and Marine tooling CLIs (`marine` and `mrepl`), and brings additional features such as project template generation, wrapper generation for deployed services, project dependencies install. See the [Fluence CLI docs](https://github.com/fluencelabs/fluence-cli#readme) for more information.

### Fluence Solution

Fluence provides an open Web3 protocol, framework and associated tooling to develop and host applications, interfaces and backends on permissionless peer-to-peer networks. An integral part of the Fluence solution is the Aquamarine stack comprised of Aqua and Marine. Aqua is a new programming language and paradigm purpose-built to program distributed networks and compose applications from distributed services. For more information on Aqua, see

* [Aqua Book](https://doc.fluence.dev/aqua-book/)
* [Aqua Playground](https://github.com/fluencelabs/aqua-playground)
* [Aqua repo](https://github.com/fluencelabs/aqua)


Marine is a general-purpose Wasm runtime and toolkit, it allows developers to build distributed services that can be composed into distributed applications by Aqua. For more information on Marine, see

* [Marine Book](https://doc.fluence.dev/marine-book/)
* [Marine repo](https://github.com/fluencelabs/marine)
* [Marine SDK](https://github.com/fluencelabs/marine-rs-sdk)

### Setup

In order to run the entire code base, Rust and Node are required. If necessary see [Install Rust](https://www.rust-lang.org/tools/install) and [NVM](https://github.com/nvm-sh/nvm) for details.

Install the Fluence CLI by running the following command:

```bash
npm install -g @fluencelabs/cli
```

You can use the REPL to locally test the services:

```bash
fluence service repl tsOracle
```

You will get the following:

```bash
Making sure service and modules are downloaded and built... done
Welcome to the Marine REPL (version 0.18.0)
Minimal supported versions
  sdk: 0.6.0
  interface-types: 0.20.0

app service was created with service id = 5e21f219-0482-49d8-bc99-bd2c05bbfefa
elapsed time 131.785135ms

1> i
Loaded modules interface:
exported data types (combined from all modules):
data Oracle:
  n: u32
  mode: u64
  freq: u32
  err_str: string

exported functions:
ts_oracle:
  fn point_estimate(tstamps: []u64, min_points: u32) -> Oracle

2> call ts_oracle point_estimate [ [1661345701640, 1661345701640, 1661345701662, 1661345701642, 1661345701643, 1661345701637, 1661345701642, 1661345701663, 1661345701678, 1661345701641, 1661345701647], 5]
result: Object({"err_str": String(""), "freq": Number(2), "mode": Number(1661345701640), "n": Number(11)})
 elapsed time: 8.608047ms

3> q
```

On the 1st step, we explored our module interface and data using the `i` command, on the 2nd we made a call of the `point_estimate` function from the `ts_oracle` interface.

If you navigate to our module directory `ts-oracle/modules/ts-oracle`, you can also unit test the code with

```bash
cargo +nightly test --release
```

It generates the output similar to:

```
....
running 6 tests
test tests::test_mean_good ... ok
test tests::test_mean_bad ... ok
test tests::test_mode ... ok
test tests::test_point_estimate_bad_2 ... ok
test tests::test_point_estimate_bad ... ok
test tests::test_point_estimate_good ... ok

test result: ok. 6 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.35s
```

For deploying the service to a peer with the `fluence` CLI tool, you need to run from the project root:

```bash
fluence deploy
```

which results in:

```bash
Making sure all services are downloaded... done
Making sure all modules are downloaded and built... done

Going to deploy services described in <path-to-examples>/aqua-examples/ts-oracle/fluence.yaml:

tsOracle:
  get: ./ts-oracle
  deploy:
    - deployId: default


? Do you want to deploy all of these services? Yes
Deploying:
  service: tsOracle
  deployId: default
  on: 12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS
... done
Compiling <path-to-examples>/aqua-examples/ts-oracle/.fluence/aqua/deployed.app.aqua... done

Currently deployed services listed in <path-to-examples>/aqua-examples/ts-oracle/.fluence/app.yaml:

tsOracle:
  default:
    - blueprintId: b2325812dc59af855ac7d1ea45ce12fb033822dc88c8a26425007bfd4eafae1c
      serviceId: 605b227c-e67a-4888-a65a-60df6a1fb862
      peerId: 12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS

```

The tool asked us if we want to deploy the service, and after confirming it, we have our service successfully deployed. Please also note in the output that we got the wrapper for our service environment generated in the `./.fluence/aqua/deployed.app.aqua` file.

### Approach

We implemented a custom service that returns the mode and frequency for an array of timestamps, see `ts-oracle/modules/ts-oracle/src` that can be deployed onto any node of the peer-to-peer network and, once deployed, used in an Aqua script. Moreover, network peers have built-in services including Kademlia and timestamp services. Both custom and bultin services are accessible by Aqua and ready for composition into an application.

Our oracle solution is implemented in Aqua and utilizes timestamps from peers selected from our Kademlia neighborhood and, for illustrative purposes, uses the deployed service to arrive at the point estimate for our oracle. See `ts-oracle/modules/ts-oracle/src/main.rs`. There certainly are better ways to process the timestamps into an oracle but for our purposes mode works.

In our Aqua script, `src/aqua/main.aqua`, we separate the timestamp collections from the subsequent oracle processing. That is, if a peer-client wants to process the timestamps locally, all that's needed are the timestamps, which can be obtained by calling the `ts_getter` function. Alternatively, the timestamps may be processed by calling one or more `ts-oracle` services deployed on the network.

```rust
-- src/aqua/main.aqua
module Main

import "@fluencelabs/aqua-lib/builtin.aqua"
import App from "deployed.app.aqua"

export App, ts_getter, ts_oracle

-- the data struct from the Wasm file
-- marine aqua ts-oracle/modules/ts-oracle/target/wasm32-wasi/release/ts_oracle.wasm
data Oracle:
    n: u32
    mode: u64
    freq: u32
    err_str: string
    raw_data: []u64

-- the point_estimate function from the Wasm file wrapped as a service
-- marine aqua ts-oracle/modules/ts-oracle/target/wasm32-wasi/release/ts_oracle.wasm
service TSOracle("service-id"):
    point_estimate: []u64, u32 -> Oracle

-- the timestamp getter drawing from the Kademlia neighborhood
-- function collects the neighborhood peers
-- retrieves and returns the timestamps 
-- the peer id gets from the wrapper of our service interface
-- for handling timeouts from the neighborhood peers, the race pattern is used
func ts_getter() -> []u64:
  rtt = 1000 -- millis
  msg = "timeout"
  res: *u64

  services <- App.services()

  on services.tsOracle.default!.peerId:
    k <- Op.string_to_b58(services.tsOracle.default!.peerId)
    nodes <- Kademlia.neighborhood(k, nil, nil)
    if Op.array_length(nodes) > 0:
      for n <- nodes par:
        on n:
          try:
            res <- Peer.timestamp_ms()
      -- whether we get res from all the nodes or rtt milliseconds passed, return res
      join res[Op.array_length(nodes) - 1]
      par Peer.timeout(rtt, msg)

  <- res

-- oracle function operating on array of timestamps utilizing a distributed
-- service to calculate the point_estimate
-- see ts-oracle/modules/ts-oracle/src/main.rs for the service implementation
-- the running service environment is injected using the generated
-- wrapper defined in .fluence/aqua/deployed.app.aqua and
-- imported in the beginning of the src/aqua/main.aqua
func ts_oracle(min_points: u32) -> Oracle:
  services <- App.services()
  res <- ts_getter()
  on services.tsOracle.default!.peerId:
    TSOracle services.tsOracle.default!.serviceId
    oracle <- TSOracle.point_estimate(res, min_points)  -- calculate mode 
  <- oracle                                             -- and return to initiating peer
```

We can run our Aqua `ts_oracle` function against the deployed processing service to get our oracle point estimate using `fluence run`:

```bash
 fluence run \
    -i src/aqua \
    -f 'ts_oracle(5)'
```

Please note that with `fluence run` we don't provide both the peer id and service id for our service. However, this information is used implicitly by the CLI tool, and is taken from definitions located in `.fluence/app.yaml` generated upon successful deployment.

The run results in below but may be different for you:

```bash
Running:
  function: ts_oracle(5)
  relay: /dns4/kras-08.fluence.dev/tcp/19001/wss/p2p/12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt
... done

Result:

{
  "err_str": "",
  "freq": 3,
  "mode": 1661337641208,
  "n": 11
}
```

Alternatively, we can run the `ts_getter` function just for the timestamps:

```bash
fluence run \
    -i src/aqua \
    -f 'ts_getter()'
```

It gives us just the timestamps, which will be different for you:

```text
Running:
  function: ts_getter()
  relay: /dns4/kras-07.fluence.dev/tcp/19001/wss/p2p/12D3KooWEFFCZnar1cUJQ3rMWjvPQg6yMV2aXWs2DkJNSRbduBWn
... done

Result:

[
  1661342995428,
  1661342995429,
  1661342995432,
  1661342995424,
  1661342995428,
  1661342995429,
  1661342995424,
  1661342995473,
  1661342995480,
  1661342995433,
  1661342995430
]
```

To do the housekeeping, we need to remove the service we deployed. It can be easily done with:

```bash
fluence remove
```

It results in the following output:

```bash
? Are you sure you want to remove app described in <path-to-examples>/aqua-examples/ts-oracle/.fluence/app.yaml? Yes
?

Currently deployed services described in <path-to-examples>/aqua-examples/ts-oracle/.fluence/app.yaml:

tsOracle:
  default:
    - blueprintId: b2325812dc59af855ac7d1ea45ce12fb033822dc88c8a26425007bfd4eafae1c
      serviceId: 605b227c-e67a-4888-a65a-60df6a1fb862
      peerId: 12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS


Do you want to remove all of them? Yes
Removing:
  service: tsOracle
  deployId: default
  peerId: 12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS
  serviceId: 605b227c-e67a-4888-a65a-60df6a1fb862
... done
```

Please notice instead of `fluence run`, you can use the Typescript stub and integrate it into a TS client. See [Aqua Playground](https://github.com/fluencelabs/aqua-playground) for more information.
