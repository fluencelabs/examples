# Verifiable Random Function With Marine And Aqua

## Overview

A [Verifiable Random Function](https://people.csail.mit.edu/silvio/Selected%20Scientific%20Papers/Pseudo%20Randomness/Verifiable_Random_Functions.pdf) (VRF) is a pseudorandom function that provides proofs that its outputs were constructed in a verifiable manner. While the proof is constructed with both public and private, i.e., the requesters private key, data, the verification only requires public data. Not surprisingly, VRFs play an important role in trustless systems, such as blockchain protocols and, of course, the Fluence network. We are implementing [EC VRF](https://github.com/Silur/ECVRF), which uses ED25519, as a Marine Wasm off-chain service callable from Aqua.

**Note:**

* **the [ECVRF](https://github.com/Silur/ECVRF) crate is provided under a GPL-3.0 [License](./LICENSE). Hence, this sub-repo is also made available under a GPL-3.0 license.**
* **the [ECVRF](https://github.com/Silur/ECVRF) crate has not undergone a security audit. Tread With Care!**

## Getting to Services

Implementing a Wasm wrapper around the ECVRF library is pretty straight forward. Aside from the proof generation and verification functions, we added a few convenience features you should only use in the intended context of experimentation. The complete code is in the [src/main.rs](./src/main.rs) file.
Compile with:

```bash
./scripts/build.sh
```

And test with:

```bash
cargo +nightly test --release
```

Which should result in:

```bash
running 4 tests
test tests::t_key_gen ... ok
test tests::test_proof_module ... ok
test tests::verify_proof_module_no_sk ... ok
test tests::verify_proof_module_with_sk ... ok

test result: ok. 4 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.19s
```

## Service Deployment

While the Wasm module handles both proof generation and verification, it seems prudent to deploy the service to different peers to separate the proof generation from the verification process.

```bash
aqua remote deploy_service \
    --addr /dns4/kras-05.fluence.dev/tcp/19001/wss/p2p/12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS \
    --config-path configs/deployment_cfg.json \
    --service vrfun \
    --sk <YOUR-SECRET_KEY>

Blueprint id:
98b3cca51ffdef00bd591da569bd606bf7a1099dd30761af3147e84ea0b3bf79
And your service id is:
"751c137d-37ea-4e57-ad22-518f6ee1900b"
```

And

```bash
aqua remote deploy_service \
    --addr /dns4/kras-07.fluence.dev/tcp/19001/wss/p2p/12D3KooWEFFCZnar1cUJQ3rMWjvPQg6yMV2aXWs2DkJNSRbduBWn \
    --config-path configs/deployment_cfg.json \
    --service vrfun \
    --sk <YOUR-SECRET_KEY>

Blueprint id:
98b3cca51ffdef00bd591da569bd606bf7a1099dd30761af3147e84ea0b3bf79
And your service id is:
"132b1b5d-295d-402c-af23-678367c53c33"
```

See [run_data.json](./data/run_data.json) for a sample file populated with the different argument settings for running the [Aqua functions](./aqua/vrf.aqua).

## VRF With Aqua


Let's have a look at our Aqua functions for both creating and verifying a proof:

```scala
-- aqua/vrf.aqua
func vrf_proof(service: FuncAddr, payload: []u8, sk:[]u8) -> ProofResult:
  on service.peer_id:
    Vrfun service.service_id
    proof_result <- Vrfun.vrf_proof(payload, sk)
  <- proof_result

func vrf_verify(service: FuncAddr, payload: []u8, proof:ProofResult) -> VerificationResult:
    on service.peer_id:
        Vrfun service.service_id
        verification <- Vrfun.verify_vrf(proof.pk, payload, proof.output, proof.proof)
    <- verification
```

In order to create a verifiable pseudorandom proof, you need to provide the following inputs to the VRF:

* some (public) input data as bytes
* your private (ed25519) key as bytes

which results in:

* an output and
* a [proof](https://docs.rs/ecvrf/0.4.3/ecvrf/struct.VrfProof.html)

For some input data provided by the user, e.g.,  ` [222, 173, 190, 239]`, we call the `vrf_proof` function like so:

```bash
aqua run \
    --input aqua/vrf.aqua \
    --addr /dns4/kras-08.fluence.dev/tcp/19001/wss/p2p/12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt \
    -f 'vrf_proof(proof_arg, payload_arg, sk_arg)' \
    --data-path data/run_data.json
```

Whic returns the proof and output as well as the pk derived from the sk, just in case:

```json
{
  "output": [
    115, 194, 116, 211, 189, 96, 252, 211, 160, 128, 67, 1, 35, 98, 3, 203, 39,
    2, 139, 239, 75, 123, 218, 2, 248, 152, 124, 164, 186, 213, 67, 15
  ],
  "pk": [
    234, 192, 114, 199, 44, 198, 65, 29, 15, 47, 10, 159, 184, 125, 1, 26, 221,
    188, 125, 60, 189, 98, 137, 165, 60, 199, 97, 92, 85, 224, 29, 47
  ],
  "proof": [
    30, 242, 203, 248, 93, 221, 218, 224, 68, 11, 90, 29, 193, 184, 139, 17, 88,
    211, 141, 198, 98, 252, 112, 102, 166, 17, 182, 244, 154, 158, 89, 34, 40,
    122, 95, 121, 49, 35, 96, 85, 36, 27, 171, 242, 190, 63, 54, 210, 229, 210,
    160, 161, 226, 147, 139, 40, 75, 163, 74, 111, 121, 49, 62, 188, 95, 185,
    159, 185, 94, 162, 148, 198, 115, 237, 15, 61, 30, 122, 106, 74, 171, 240,
    74, 71, 217, 51, 200, 195, 161, 233, 162, 50, 233, 176, 100, 13
  ],
  "stderr": ""
}
```

We can know utilize these parameters to verify the (pseudo) randomness of the result using the prepared [proof_data.json](./data/proof_data.json) file with the above results parameters:

```bash
aqua run \
    --input aqua/vrf.aqua \
    --addr /dns4/kras-08.fluence.dev/tcp/19001/wss/p2p/12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt \
    -f 'vrf_verify(verify_arg, payload_arg, proof_result)' \
    --data-path data/proof_data.json
```

which gives us the expected but nevertheless reassuring:

```json
{
  "stderr": "",
  "verified": true
}
```

If you change any of the verification parameters, such as the input parameter, the verification fails. For example, change `"payload_arg": [222, 173, 190, 239]` to `"payload_arg": [222, 173, 190, 240]`:

```bash
 aqua run \
    --input aqua/vrf.aqua \
    --addr /dns4/kras-08.fluence.dev/tcp/19001/wss/p2p/12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt \
    -f 'vrf_verify(verify_arg, bad_payload_arg, proof_result)' \
    --data-path data/proof_data.json
```

and the verification fails:

```json
{
  "stderr": "",
  "verified": false
}
```


In addition to the core `proof` and `verify` functions, a `vrf_rountrip` function for a test run is available. Moreover, we also provide a (ed25519) key generation function for convenience purposes. In general, **you should not rely on a (untrusted) peer to generate your secret key** and instead use some client side tool, e.g., openssl, to create and manage your ED25519 keypair(s).

```rust
// src/main.rs
#[marine]
// #[derive(Default)]
pub fn gen_keys() -> KeyPair {
    let (sk, pk) = keygen();

    KeyPair {
        pk: pk.to_bytes().to_vec(),
        sk: sk.to_bytes().to_vec(),
    }
}
```

The corresponding Aqua implementation is:

```scala
-- aqua/vrf.aqua
func get_keys(service: FuncAddr) -> KeyPair:
  on service.peer_id:
    Vrfun service.service_id
    res <- Vrfun.gen_keys()
  <- res
```

And you can get a keypair with Aqua and the [run_data.json](./data/run_data.json) file like so:

```bash
aqua run \
    --input aqua/vrf.aqua \
    --addr /dns4/kras-08.fluence.dev/tcp/19001/wss/p2p/12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt \
    -f 'get_keys(proof_arg)' \
    --data-path data/run_data.json
```

Which provides a ED25519 keypair in bytes:

```json

  "pk": [
    190, 224, 92, 34, 161, 20, 20, 60, 246, 240, 179, 93, 130, 228, 148, 215,
    41, 140, 155, 132, 237, 188, 114, 150, 186, 95, 51, 129, 169, 173, 154, 119
  ],
  "sk": [
    230, 18, 194, 149, 33, 251, 226, 223, 244, 115, 82, 210, 61, 198, 68, 233,
    13, 47, 188, 209, 82, 99, 234, 34, 40, 61, 54, 54, 108, 238, 114, 13
  ]
}
```

## Summary

We provide a Marine Wasm wrapper and corresponding Aqua implementation around the *ECVRF* ED25519 Rust project. As a low-cost, off-chain source of pseudorandomness, Fluence users, and especially Marine Wasm developers, do not need to rely on (trustless) peers to provide randomness. Moreover, developers may anchor output and proof on-chain for immutable references and off-chain, or even on-chain, verification.

