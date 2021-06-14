# Timestamp Oracle PoC

## Problem

Getting accurate timestamps can be problematic in various contexts including blockchains.

## Solution

Timestamp oracles can alleviate this concern by aggregating and processing a variety of timestamp sources into a point- or range-estimate. The Fluence peer-to-peer network offers a (soon to be) large number of independent nodes that can serve as timestamp sources. Moreover, through Kademlia or Trustgraph neighborhood specification, trustworthy, spam-free nodes can be queried to seed a timestamp oracle.

**Note: The timestamps are currently NOT signed by the nodes. But that should be easily improved. Also, we are not using a Trustgraph.**

### Approach

We provide an Aqua application that returns the mode and frequency of the mode for ten timestamps in milliseconds procured in parallel from ten different network nodes. There are better ways to process the timestamp results but for PoC purposes, mode works.

```aqua
import "builtin.aqua"

service Op2("op"):
    identity(s: u64)
     array(a: string, b: u64) -> string

data Oracle:
    n: u32
    mode: u64
    freq: u32
    err_str: string

service TSOracle("service-id"):
    point_estimate: []u64, u32 -> Oracle

func ts_oracle(node: string, oracle_service_id: string, min_points:u32) -> Oracle:
  on node:
    k <- Op.string_to_b58(node)
    nodes <- Kademlia.neighborhood(k, false)
    res: *u64
    for n <- nodes par:
      on n:
        try:
          res <- Peer.timestamp_ms()
    Op2.identity(res!9)

  on node:
    TSOracle oracle_service_id
    oracle <- TSOracle.point_estimate(res, min_points)
  <- oracle
```

and a simple Rust Wasm timestamp processing service:

```rust
//snip
fn mode(data: &Vec<u64>) -> (u32, u64) {
    let frequencies = data
        .into_iter()
        .fold(HashMap::<u64, u32>::new(), |mut freqs, value| {
            *freqs.entry(*value).or_insert(0) += 1;
            freqs
        });

    let mode = frequencies
        .clone()
        .into_iter()
        .max_by_key(|&(_, count)| count)
        .map(|(value, _)| value)
        .unwrap();

    (*frequencies.get(&mode).unwrap(), mode)
}

#[marine]
#[derive(Default, Debug)]
pub struct Oracle {
    pub n: u32,
    pub mode: u64,
    pub freq: u32,
    pub err_str: String,
}

#[marine]
pub fn point_estimate(tstamps: Vec<u64>, min_points: u32) -> Oracle {
    if tstamps.len() < min_points as usize {
        return Oracle {
            err_str: format!(
                "Expected at least {} points but onl got {}",
                min_points,
                tstamps.len()
            ),
            ..<_>::default()
        };
    }

    if tstamps.len() < 1 {
        return Oracle {
            err_str: format!("Expected at least one point but onl got none"),
            ..<_>::default()
        };
    }

    let (freq, mode) = mode(&tstamps);

    Oracle {
        n: tstamps.len() as u32,
        mode,
        freq,
        ..<_>::default()
    }
}
//snip
```

We can run our Aqua script against the deployed processing service:

```
fldist run_air -p air-scripts/ts_getter.ts_oracle.air  -d '{"node":"12D3KooWHLxVhUQyAuZe6AHMB29P7wkvTNMn7eDMcsqimJYLKREf", "oracle_service_id":"519ba491-d32a-4994-b7ae-03ba532f15fb", "min_points":5}' --generated
[
  {
    "err_str": "",
    "freq": 2,              -- this may change
    "mode": 1623713287898,  -- this changes, of course
    "n": 10
  }
]
```