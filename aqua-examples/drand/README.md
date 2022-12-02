# League Of Entropy Drand

## Introduction

Randomness is critical to many application ranging from statistical sampling to games to cryptography. [Randomness](https://en.wikipedia.org/wiki/Randomness) is defined to be void of any predictability and sequential randomness should have no order. Yet, randomness is hard to come by to begin with and even more so in open, permissionless systems where we want not only randomness but verifiable randomness. In our [VRFun](../vrfun/) example, we illustrate how [Verifiable Random Functions](https://people.csail.mit.edu/silvio/Selected%20Scientific%20Papers/Pseudo%20Randomness/Verifiable_Random_Functions.pdf) can be used to satisfy this requirement. However, using the implemented VRF requires the user to provide (a one-time) secret key introducing a significant, and in most cases untenable, element of trust.

[Drand](https://drand.love/), a verifiable randomness beacon provided by the [League of Entropy](https://en.wikipedia.org/wiki/League_of_entropy) every 30 seconds, provides randomness as a decentralized service and is already utilized by the likes of [Filecoin](https://spec.filecoin.io/libraries/drand/) in production environments. Since Drand can greatly help Fluence developers to introduce proper randomness into their applications, we provide Marine wrappers for both the Drand HTTP API and verification logic.

For more details on Drand, including their security model, see their [documentation](https://drand.love/docs/).

## Marine And Drand

If you are new to Fluence or need a refresher on Marine and Aqua, please see the [developer docs](https://fluence.dev/docs/learn/overview).

Wrapping the Drand HTTP API with Marine is straight forward and only requires the [curl module](./services/curl_adapter/) as a dependency to our [drand service](./services/drand). As you can see when inspecting [main.rs](./services/drand/src/main.rs), the service closely follows the Drand HTTP API with some adjustments made in the return data structures. See the *test* section for usage examples.

You compile the service code with [build script](./services/scripts/build.sh), which places the Wasm files in the [artifacts](./services/artifacts/) directory. Once the Wasm modules are created, we can run the tests with the *cargo test* command in the [drand dir](./services/drand/). Recall that we are using the [marine test sdk](https://crates.io/crates/marine-rs-sdk-test), which requires the existence of the Wasm module(s).

```bash
cargo +nightly test --release
<...>
running 5 tests
test tests::test_chain ... ok
test tests::test_info ... ok
test tests::test_latest ... ok
test tests::test_round ... ok
about to match verify
ok verify
test tests::test_verify ... ok

test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 1.85s
```

If you want, you can also interact with the various method via the local Marine Repl. In the [ dir](./services)

```bash
mrepl configs/Config.toml

mrepl configs/Config.toml
Welcome to the Marine REPL (version 0.18.7)
Minimal supported versions
  sdk: 0.6.0
  interface-types: 0.20.0

app service was created with service id = 94bacc4e-0e65-4e20-972f-657d5ef60d69
elapsed time 182.130122ms

1> i
Loaded modules interface:
exported data types (combined from all modules):
data Randomness:
  round: u64
  randomness: string
  signature: string
  previous_signature: string
<...>
exported functions:
curl_adapter:
  fn curl_request(cmd: []string) -> MountedBinaryResult
drand:
  fn round(url: string, chain_hash: string, round: u64) -> RResult
  fn verify_bls(pk: string, round: u64, prev_signature: string, signature: string) -> VResult
  fn info(url: string, chain_hash: string) -> IResult
  fn chains(url: string) -> CResult
  fn latest(url: string, chain_hash: string) -> RResult

2>
```

Let's get the chain hash for good measure using one of the public endpoints provided by the Drand [developer documentation](https://drand.love/developer/http-api/#public-endpoints):

```bash
2> call drand chains "https://api3.drand.sh"
result: Object {"chains": Array [String("8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce")], "stderr": String("")}
 elapsed time: 1.019780615s
3>
```

which gives us a list of (one) chain hashes we need in order to parameterize any of the subsequent HTTP calls. Feel free to work yourself up to the *latest* and *round* methods.

Now that we have a functional Wasm adapter for the Drand HTTP API, we can deploy our Wasm modules as services to one or more peers. Note that we deployed the following services which may or may not be available by the time you read this:

```json
[
  {"peer_id": "12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi", "service_id":"9ce718ce-a4e6-485e-b33f-7014fc47c01e"}, 
  {"peer_id": "12D3KooWEFFCZnar1cUJQ3rMWjvPQg6yMV2aXWs2DkJNSRbduBWn", "service_id":"9ce718ce-a4e6-485e-b33f-7014fc47c01e"}
] 
```

Now we just got to write our Aqua.

## Aqua And Drand

The [Aqua](/aqua/drand_lib.aqua) code is straight forward providing bindings to each of the public Marine Wasm methods. For example,

```python
-- aqua/drand.aqua
func chains(addr: ServiceAddress, url:string) -> CResult:
  on addr.peer_id:
    Drand addr.service_id
    res <- Drand.chains(url)
  <- res
```

binds to the *chains* Wasm method we just explored with the local REPL. Take a minute and walk through the code and compare it to your REPL experiments. These functions give you the tools to build a randomness construct suitable to your use case and environment.

In the [examples](./aqua/drand_examples.aqua) file, we provide two Drand use examples. The *verified_randomness* function splits the randomness getter and verifier across different peer/service instances to further minimize the any peer shenanigans. Using the above services:

```python
aqua run \
  --addr /dns4/kras-04.fluence.dev/tcp/19001/wss/p2p/12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi \
  -i aqua \
  -f 'verified_randomness(arg1, arg2)' \
  --data '{"arg1":[{"peer_id":"12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi", "service_id":"23b77cdd-b384-4d55-b164-b4ca9b019393"},{"peer_id":"12D3KooWEFFCZnar1cUJQ3rMWjvPQg6yMV2aXWs2DkJNSRbduBWn", "service_id":"b6803922-9984-4176-bdde-36ea0420d6b5"}],"arg2": "https://api.drand.sh"}'


[
true,
"ee465e98bf4aa724d67198e7e453f925f38f267d00b5fa36b07aaddae62aea82",
"ee465e98bf4aa724d67198e7e453f925f38f267d00b5fa36b07aaddae62aea82"
]
```

which gives us back the verification state, true, and the randomness from both the *latest* getter and the *verify* result, which we expect to be the same.

The second example, the *verified_randomness_plus* function, extends the previous example and explicitly gets the prior (to latest) round to validate the signature chain as an additional check. Recall,  *previous_ signature* at round<sub>t</sub> is the *signature* at round<sub>t-1<sub>:

```aqua
aqua run \
  --addr /dns4/kras-04.fluence.dev/tcp/19001/wss/p2p/12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi \
  -i aqua \
  -f 'verified_randomness_plus(arg1, arg2)' \
  --data '{"arg1":[{"peer_id":"12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi", "service_id":"23b77cdd-b384-4d55-b164-b4ca9b019393"},{"peer_id":"12D3KooWEFFCZnar1cUJQ3rMWjvPQg6yMV2aXWs2DkJNSRbduBWn", "service_id":"b6803922-9984-4176-bdde-36ea0420d6b5"}],"arg2": "https://api.drand.sh"}'


{
  "error": "",
  "randomness": "90f9b8ed6025f551a777b4400fa3ac72769f5cab085bfcef31ebfd163221f0df",
  "success": true
}
```

And that's all there is to it to bring verifiable randomness not only to your Fluence applications but also DApps.
