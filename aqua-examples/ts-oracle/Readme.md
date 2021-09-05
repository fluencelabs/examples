# Timestamp Oracle PoC

## Overview

Getting accurate timestamps can be problematic in various contexts including blockchains. Timestamp oracles can alleviate this concern by aggregating and processing a variety of timestamp sources into a point- or range-estimate. Of course, the acquisition of accurate timestamps not subject to manipulation is a critical attribute of a good oracle.  The Fluence peer-to-peer network offers a large number of independent nodes that can serve as timestamp sources from either Kademilia or TrustGraph neighborhoods.

**Note: The timestamps are currently** **not** **signed by the nodes. But that could be easily addressed.**

### Fluence Solution

Fluence provides an open Web3 protocol, framework and associated tooling to develop and host applications, interfaces and backends on permissionless peer-to-peer networks. An integral part of the Fluence solution is the Aquamarine stack comprised of Aqua and Marine. Aqua is a new programming language and paradigm purpose-built to program distributed networks and compose applications from distributed services. For more information on Aqua, see

* [Aqua Book](https://app.gitbook.com/@fluence/s/aqua-book/)
* [Aqua Playground](https://github.com/fluencelabs/aqua-playground)
* [Aqua repo](https://github.com/fluencelabs/aqua)


Marine is a general purpose Wasm runtime and toolkit, allows developers to build distributed services that can be composed into distributed applications by Aqua. For more information on Marine, see

* [Marine repo](https://github.com/fluencelabs/marine)
* [Marine SDK](https://github.com/fluencelabs/marine-rs-sdk)

### Setup

*Note that we already deployed the service to node `12D3KooWHLxVhUQyAuZe6AHMB29P7wkvTNMn7eDMcsqimJYLKREf` with service id `ed657e45-0fe3-4d6c-b3a4-a2981b7cadb9`, which is all what's needed to use the service in Aqua.*

In order to run the entire code base, Rust and Node required. If necessary see [Install Rust](https://www.rust-lang.org/tools/install) and [NVM](https://github.com/nvm-sh/nvm) for details.

Install the following tools:

```bash
cargo install mrepl 
cargo install marine

npm -g install @fluencelabs/aqua
npm -g install @fluencelabs/fldist
```

To compile the code to the wasi target:

```bash
./scripts/build.sh
```

You can use the REPL to locally test the services:

```bash
mrepl Config.toml
```

test the code with

```bash
cargo +nightly test --release
```

and deploy the service to a peer of your choice with the `fldist` tool:

```bash
fldist new_service \
       --ms artifacts/ts_oracle.wasm:artifacts/ts_oracle_cfg.json \
       --name ts-consensus \
       --verbose
```

As always, take note of the service id and let's compile our Aqua scripts:

```bash
# results in air-scripts ts_getter.ts
aqua -i aqua-scripts -o air-scripts 
```

which generates Typescript code wrapping of the compiled Aqua intermediary representation (AIR) or we can use the `-a` flag to compile Aqua to AIR files:

```bash
# results in air-scripts 
# ts_getter.ts_getter.air and ts_getter.ts_oracle.air
aqua -i aqua-scripts -o air-scripts -a
```
### Approach

We implemented a custom service that returns the mode and frequency for an array of timestamps, see `src/` that can be deployed on to any node of the peer-to-peer network and, once deployed, used to in an Aqua script. Moreover, network peers have builtin services including Kademlia and timestamp services. Both custom and bultin services are accessible by Aqua and ready for composition into an application.

Our oracle solution is implemented in Aqua and utilizes timestamps from peers selected from our Kademlia neighborhood and, for illustrative purposes, use the deployed service to arrive at the point estimate for our oracle. See `src/main.rs`. There certanly are better ways to process the timestamps into an oracle but for our purposes, mode works.

In our Aqua script, `aqua-scripts/ts_getter.aqua`, we separate the timestamp collections from the subsequent oracle processing. That is, if a peer-client wants to process the timestamps locally, all that's needed are the timestamps, which can be obtained by calling the `ts_getter` function. Alternatively, the timestamps may be processed by calling one or more `ts-oracle` services deployed on the network.

```aqua
-- aqua-scripts/ts_getter.aqua
import "builtin.aqua"

service Op2("op"):
    identity(s: u64)
     array(a: string, b: u64) -> string

-- the data struct from the Wasm file
-- marine aqua artifacts/ts_oracle.wasm
data Oracle:
    n: u32
    mode: u64
    freq: u32
    err_str: string
    raw_data: []u64

-- the point_estimate function from the Wasm file wrapped as a service
-- marine aqua artifacts/ts_oracle.wasm
service TSOracle("service-id"):
    point_estimate: []u64, u32 -> Oracle

-- the timestamp getter drawing from the Kademlia neighborhood
-- function collects the neighborhood peers
-- retrieves and returns the timestamps 
func ts_getter(node: string) -> []u64:
  res: *u64
  on node:
    k <- Op.string_to_b58(node)
    nodes <- Kademlia.neighborhood(k, nil, nil)
    for n <- nodes par:
      on n:
        try:
          res <- Peer.timestamp_ms()
    Op2.identity(res!9)
  <- res

-- oracle function operating on array of timestamps utilizing a distributed
-- service to calculate the point_estimate
-- see src/main.rs for the service implementation
func ts_oracle(node: string, oracle_service_id: string, min_points:u32) -> Oracle:
  res <- ts_getter(node)
  
  on node:
    TSOracle oracle_service_id
    oracle <- TSOracle.point_estimate(res, min_points)  -- calculate mode 
  <- oracle                                             -- and return to initiating peer
```

We can run our Aqua `ts_oracle` script against the deployed processing service to get our oracle point estimate (Note that you can replace the service id with the one you obtained from your deployment):

```bash
fldist run_air \
      -p air-scripts/ts_getter.ts_oracle.air  \
      -d '{"node":"12D3KooWHLxVhUQyAuZe6AHMB29P7wkvTNMn7eDMcsqimJYLKREf",
           "oracle_service_id":"ed657e45-0fe3-4d6c-b3a4-a2981b7cadb9", 
           "min_points":5}' \
      --generated
```

Which results in:

```text
[
  {
    "err_str": "",
    "freq": 2,              -- this may change
    "mode": 1623713287898,  -- this changes, of course
    "n": 10
  }
]
```

Alternatively, we can run the `ts_getter` functions just for the timestamps:

```bash
fldist run_air \
       -p air-scripts/ts_getter.ts_getter.air  \
       -d '{"node":"12D3KooWHLxVhUQyAuZe6AHMB29P7wkvTNMn7eDMcsqimJYLKREf",
            "oracle_service_id":"ed657e45-0fe3-4d6c-b3a4-a2981b7cadb9",
            "min_points":5, "n_ts": 10}' \
      --generated
```

Which gives us just the timestamps:

```text
[
  [
    1624834792801,   # Note: your timestamps will have different values
    1624834792791,
    1624834792796,
    1624834792797,
    1624834792795,
    1624834792783,
    1624834792800,
    1624834792785,
    1624834792806,
    1624834792793
  ]
]
```

Instead of `fldist`, you can use the Typescript stub and integrate it into a TS client. See [Aqua Playground](https://github.com/fluencelabs/aqua-playground) for more information.
