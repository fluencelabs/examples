# Test Client

## Overview

In `aqua/timestamp_gatherer.aqua` we provide a simple timestamp getter function, `ts_getter`. `ts_getter` illustrates how to use the [builtin timstamp](https://github.com/fluencelabs/fluence/blob/9b2474e04cdce62d571cd28c47d0dda0baa43b76/particle-builtins/src/builtins.rs#L37) function with Aqua.

```aqua
-- aqua/timestamp_gatherer.aqua
-- simple timestamp getter for kademlia neighborhood which is max size 20
func ts_getter() -> []u64:
  -- on this peer
  on HOST_PEER_ID:
    -- convert peer id to b58
    k <- Op.string_to_b58(HOST_PEER_ID)
    -- get all neighbors
    nodes <- Kademlia.neighborhood(k, nil, nil)
    res: *u64
    -- for each neighbor
    for n <- nodes par:
      -- on selected neighbor peer
      on n:
        -- get the timestamp from that node
        res <- Peer.timestamp_ms()
      -- hot fix to force switching to peer
      Op.noop()
    -- join the results, which is tricky right now since we can't use array len
    -- the testnet size n is 10 so n -1
    join res[9]
  <- res
```

This function works well under optimal conditions but is problematic in reality where peers drop-off or disappear. We can use timeouts and some creative array filling to accommodate response variability while still getting our join to complete:

```aqua

-- timestamp getter with error collector over neighborhood 
func ts_getter_with_timeout()-> []u64, []string:
  -- timeout in ms
  rtt  = 1000

  res: *u64

  -- error value for no timestamp
  err_value = 0

  -- neighborhood n = 20 decr by 1 for array 
  n_neighborhood = 19

  -- err message
  msg = "timeout"
  
  -- collect non-responsive peer ids, if any
  dead_peers: *string
  on HOST_PEER_ID:
    k <- Op.string_to_b58(HOST_PEER_ID)
    nodes <- Kademlia.neighborhood(k, nil, nil)
    for n <- nodes par:
        status: *string
        on n:
            res <- Peer.timestamp_ms()
            status <<- "success"
        par status <- Peer.timeout(rtt, msg)
        if status! != "success":
          res <<- err_value
          dead_peers <<- n
        Op.noop()
        
    join res[n_neighborhood]
  <- res, dead_peers
```

We can execute Aqua with the [Fluence JS client](./src/index.ts):

```aqua
npm i
npm run compile-aqua
npm start
```

or from the command line:

```aqua
aqua run \
     --addr /dns4/kras-05.fluence.dev/tcp/19001/wss/p2p/12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS \
     -i aqua \
     -f 'ts_getter()'
```

and:

```aqua
aqua run \
     --addr /dns4/kras-05.fluence.dev/tcp/19001/wss/p2p/12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS \
     -i aqua \
     -f 'ts_getter_with_timeout()'
```

