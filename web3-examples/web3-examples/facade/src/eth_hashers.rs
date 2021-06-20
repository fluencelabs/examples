/*
 * Copyright 2021 Fluence Labs Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
use marine_rs_sdk::marine;
use tiny_keccak::{Hasher, Keccak};

#[marine]
pub fn eth_hash_method_id(input: Vec<u8>) -> Vec<u8> {
    let mut output = [0u8; 32];
    let mut keccak = Keccak::v256();

    keccak.update(&input);
    keccak.finalize(&mut output);
    output.to_vec()
}

#[marine]
pub fn test_eth_hash_method_id() -> String {
    use hex::encode;

    // see https://docs.soliditylang.org/en/latest/abi-spec.html#examples
    let input = b"baz(uint32,bool)".to_vec();
    let expected = String::from("cdcd77c0");
    let res = eth_hash_method_id(input);
    let res = format!("{}", hex::encode(&res[..4]));

    if res == expected {
        return "test passed".to_string();
    }
    "test failed".to_string()
}
