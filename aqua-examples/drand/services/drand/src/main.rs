/*
 * Copyright 2022 Fluence Labs Limited
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

// use drand_verify::{derive_randomness, g1_from_fixed, verify};
use drand_verify::{derive_randomness, g1_from_fixed, verify};
use hex;
use marine_rs_sdk::module_manifest;
use marine_rs_sdk::{marine, MountedBinaryResult};
use serde::{Deserialize, Serialize};

use std::convert::TryInto;

module_manifest!();

pub fn main() {}

#[marine]
#[derive(Deserialize, Serialize, Debug)]
pub struct Chain {
    pub hash: String,
}

#[marine]
#[derive(Deserialize, Serialize, Debug)]
pub struct Chains {
    pub hashes: Vec<Chains>,
}

#[marine]
pub struct DResult {
    pub stderr: String,
    pub stdout: String,
}

#[marine]
#[derive(Deserialize, Serialize, Debug)]
pub struct DInfo {
    pub public_key: String,
    pub period: u64,
    pub genesis_time: u64,
    pub hash: String,
}

#[marine]
#[derive(Deserialize, Serialize, Debug)]
pub struct Randomness {
    pub round: u64,
    pub randomness: String,
    pub signature: String,
    pub previous_signature: String,
}

#[marine]
pub fn chains(url: String, hash_chain: bool) -> DResult {
    let url = format!("{}/chains", url);
    let curl_cmd = vec![
        "-X".to_string(),
        "GET".to_string(),
        "-H".to_string(),
        "Accept: application/json".to_string(),
        url,
    ];

    let response = curl_request(curl_cmd);
    if response.error.len() > 0 {
        return DResult {
            stderr: response.error.to_string(),
            stdout: "".to_string(),
        };
    }
    match String::from_utf8(response.clone().stdout) {
        Ok(r) => {
            let obj: Vec<String> = serde_json::from_str(&r).unwrap();
            if !hash_chain {
                DResult {
                    stdout: r,
                    stderr: "".to_owned(),
                }
            } else {
                DResult {
                    stdout: format!("{}", obj[0]),
                    stderr: "".to_owned(),
                }
            }
        }
        Err(e) => DResult {
            stdout: "".to_owned(),
            stderr: e.to_string(),
        },
    }
}

#[marine]
pub fn info(url: String, chain_hash: String, pub_key: bool) -> DResult {
    let url = format!("{}/{}/info", url, chain_hash);
    let curl_cmd = vec![
        "-X".to_string(),
        "GET".to_string(),
        "-H".to_string(),
        "Accept: application/json".to_string(),
        url,
    ];

    let response = curl_request(curl_cmd);
    if response.error.len() > 0 {
        return DResult {
            stderr: response.error.to_string(),
            stdout: "".to_string(),
        };
    }
    match String::from_utf8(response.clone().stdout) {
        Ok(r) => {
            let obj: DInfo = serde_json::from_str(&r).unwrap();
            if pub_key {
                DResult {
                    stdout: obj.public_key,
                    stderr: "".to_owned(),
                }
            } else {
                DResult {
                    stdout: r,
                    stderr: "".to_owned(),
                }
            }
        }
        Err(e) => DResult {
            stdout: "".to_owned(),
            stderr: e.to_string(),
        },
    }
}

#[marine]
pub fn randomness(url: String, chain_hash: String, round: String) -> DResult {
    let mut uri: String;
    if &round.to_lowercase() == "latest" {
        uri = format!("{}/{}/public/latest", url, chain_hash);
    } else {
        let round = &round.parse::<u64>().unwrap();
        uri = format!("{}/{}/public/{}", url, chain_hash, round);
    }

    let curl_cmd = vec![
        "-X".to_string(),
        "GET".to_string(),
        "-H".to_string(),
        "Accept: application/json".to_string(),
        uri,
    ];

    let response = curl_request(curl_cmd);
    if response.error.len() > 0 {
        return DResult {
            stderr: response.error.to_string(),
            stdout: "".to_string(),
        };
    }
    match String::from_utf8(response.clone().stdout) {
        Ok(r) => DResult {
            stdout: r,
            stderr: "".to_owned(),
        },
        Err(e) => DResult {
            stdout: "".to_owned(),
            stderr: e.to_string(),
        },
    }
}

#[marine]
pub fn verify_bls(pk: String, round: u64, prev_signature: String, signature: String) -> DResult {
    let hex_pk: [u8; 48] = hex::decode(&pk).unwrap().as_slice().try_into().unwrap();
    let pk = g1_from_fixed(hex_pk).unwrap();

    println!("about to match verify");

    let hex_sig = hex::decode(signature).unwrap();
    let hex_psig = hex::decode(prev_signature).unwrap();

    match verify(&pk, round, &hex_psig, &hex_sig) {
        Err(err) => DResult {
            stderr: format!("Error during verification: {}", err),
            stdout: "".to_string(),
        },
        Ok(valid) => {
            println!("ok verify");
            if valid {
                println!("Verification succeeded");
                let randomness = derive_randomness(&hex_sig);
                println!("Randomness: {}", hex::encode(&randomness));
                DResult {
                    stdout: hex::encode(&randomness),
                    stderr: "".to_string(),
                }
            } else {
                DResult {
                    stdout: "".to_string(),
                    stderr: format!("Verification failed"),
                }
            }
        }
    }
}

#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(cmd: Vec<String>) -> MountedBinaryResult;
}

#[cfg(test)]
mod tests {
    // use super::*;
    use super::Randomness;
    use marine_rs_sdk_test::marine_test;

    const URL: &'static str = "https://api.drand.sh";

    #[marine_test(
        config_path = "/Users/bebo/localdev/examples/aqua-examples/drand/services/configs/Config.toml",
        modules_dir = "/Users/bebo/localdev/examples/aqua-examples/drand/services/artifacts/"
    )]
    fn test_chain(drand: marine_test_env::drand::ModuleInterface) {
        let res = drand.chains(URL.to_string(), false);
        assert_eq!(res.stderr.len(), 0);

        let res = drand.chains(URL.to_string(), true);
        assert_eq!(res.stderr.len(), 0);
    }

    #[marine_test(
        config_path = "/Users/bebo/localdev/examples/aqua-examples/drand/services/configs/Config.toml",
        modules_dir = "/Users/bebo/localdev/examples/aqua-examples/drand/services/artifacts/"
    )]
    fn test_info(drand: marine_test_env::drand::ModuleInterface) {
        let chain_hash =
            "8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce".to_string();
        let res = drand.info(URL.to_string(), chain_hash.clone(), false);
        assert_eq!(res.stderr.len(), 0);
        assert!(res.stdout.len() > 0);

        let res = drand.info(URL.to_string(), chain_hash, true);
        assert_eq!(res.stderr.len(), 0);
        assert!(res.stdout.len() > 0);
    }

    #[marine_test(
        config_path = "/Users/bebo/localdev/examples/aqua-examples/drand/services/configs/Config.toml",
        modules_dir = "/Users/bebo/localdev/examples/aqua-examples/drand/services/artifacts/"
    )]
    fn test_randomness(drand: marine_test_env::drand::ModuleInterface) {
        let chain_hash =
            "8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce".to_string();
        let res = drand.randomness(URL.to_string(), chain_hash.clone(), "latest".to_owned());
        assert_eq!(res.stderr.len(), 0);
        assert!(res.stdout.len() > 0);

        let rand_obj: Randomness = serde_json::from_str(&res.stdout).unwrap();
        let prev_round = rand_obj.round - 1;
        let res = drand.randomness(
            URL.to_string(),
            chain_hash.clone(),
            format!("{}", prev_round),
        );
        assert_eq!(res.stderr.len(), 0);
        assert!(res.stdout.len() > 0);

        let prev_rand_obj: Randomness = serde_json::from_str(&res.stdout).unwrap();

        assert_eq!(rand_obj.previous_signature, prev_rand_obj.signature);
    }

    #[marine_test(
        config_path = "/Users/bebo/localdev/examples/aqua-examples/drand/services/configs/Config.toml",
        modules_dir = "/Users/bebo/localdev/examples/aqua-examples/drand/services/artifacts/"
    )]
    fn test_verify(drand: marine_test_env::drand::ModuleInterface) {
        // get chain hash
        let chain_hash = drand.chains(URL.to_string(), true).stdout;
        println!("verify-chain hash: {:?}", chain_hash);

        // get public key for chain
        let pk = drand.info(URL.to_string(), chain_hash.clone(), true).stdout;
        println!("verify-pk: {:?}", chain_hash);

        // get latest randomness
        let res = drand
            .randomness(URL.to_string(), chain_hash.clone(), "latest".to_owned())
            .stdout;
        println!("verify randomness: {:?}", res);

        let randomness: Randomness = serde_json::from_str(&res).unwrap();
        println!("verify randomness: {:?}", randomness);

        // verify randomness
        let res = drand.verify_bls(
            pk,
            randomness.round,
            randomness.previous_signature,
            randomness.signature,
        );
        println!("verify: {:?}", res);
    }

    #[test]
    fn doodle() {
        use hex_literal::hex;
        const PK_LEO_MAINNET: [u8; 48] = hex!("868f005eb8e6e4ca0a47c8a77ceaa5309a47978a7c71bc5cce96366b5d7a569937c529eeda66c7293784a9402801af31");
        let pk = "868f005eb8e6e4ca0a47c8a77ceaa5309a47978a7c71bc5cce96366b5d7a569937c529eeda66c7293784a9402801af31";
        println!("hex : {:?}", hex::decode(pk).unwrap());

        // let h: [u8; 48] = hex!("868f005eb8e6e4ca0a47c8a77ceaa5309a47978a7c71bc5cce96366b5d7a569937c529eeda66c7293784a9402801af31");
        println!("hex!: {:?}", PK_LEO_MAINNET);
    }
}
