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
pub struct CResult {
    pub chains: Vec<String>,
    stderr: String,
}

#[marine]
#[derive(Deserialize, Serialize, Debug)]
pub struct Info {
    pub public_key: String,
    pub period: u64,
    pub genesis_time: u64,
    pub hash: String,
}

impl Info {
    fn empty() -> Self {
        Info {
            public_key: "".to_owned(),
            period: 0,
            genesis_time: 0,
            hash: "".to_owned(),
        }
    }
}

#[marine]
pub struct IResult {
    info: Info,
    stderr: String,
}

#[marine]
#[derive(Deserialize, Serialize, Debug)]
pub struct Randomness {
    pub round: u64,
    pub randomness: String,
    pub signature: String,
    pub previous_signature: String,
}

impl Randomness {
    fn empty() -> Self {
        Randomness {
            round: 0,
            randomness: "".to_owned(),
            signature: "".to_owned(),
            previous_signature: "".to_owned(),
        }
    }
}

#[marine]
pub struct RResult {
    pub randomness: Randomness,
    pub stderr: String,
}

#[marine]
pub struct VResult {
    verified: bool,
    randomness: String,
    stderr: String,
}

fn curl_cmd(url: String) -> Vec<String> {
    vec![
        "-X".to_string(),
        "GET".to_string(),
        "-H".to_string(),
        "Accept: application/json".to_string(),
        url,
    ]
}

#[marine]
pub fn chains(url: String) -> CResult {
    let url = format!("{}/chains", url);
    let curl_cmd = curl_cmd(url);

    let response = curl_request(curl_cmd);
    if response.error.len() > 0 {
        return CResult {
            stderr: response.error.to_string(),
            chains: vec![],
        };
    }

    match String::from_utf8(response.stdout) {
        Ok(r) => {
            let chains: Result<Vec<String>, serde_json::Error> = serde_json::from_str(&r);
            match chains {
                Ok(r) => CResult {
                    chains: r,
                    stderr: "".to_string(),
                },
                Err(e) => CResult {
                    chains: vec![],
                    stderr: e.to_string(),
                },
            }
        }
        Err(e) => CResult {
            chains: vec![],
            stderr: e.to_string(),
        },
    }
}

#[marine]
pub fn info(url: String, chain_hash: String) -> IResult {
    let url = format!("{}/{}/info", url, chain_hash);
    let curl_cmd = curl_cmd(url);

    let response = curl_request(curl_cmd);
    if response.error.len() > 0 {
        return IResult {
            stderr: response.error.to_string(),
            info: Info::empty(),
        };
    }
    match String::from_utf8(response.clone().stdout) {
        Ok(r) => match serde_json::from_str(&r) {
            Ok(o) => IResult {
                info: o,
                stderr: "".to_string(),
            },
            Err(e) => IResult {
                info: Info::empty(),
                stderr: e.to_string(),
            },
        },
        Err(e) => IResult {
            info: Info::empty(),
            stderr: e.to_string(),
        },
    }
}

pub fn randomness(url: String) -> RResult {
    let curl_cmd = curl_cmd(url);

    let response = curl_request(curl_cmd);
    if response.error.len() > 0 {
        return RResult {
            stderr: response.error.to_string(),
            randomness: Randomness::empty(),
        };
    }
    match String::from_utf8(response.clone().stdout) {
        Ok(r) => match serde_json::from_str(&r) {
            Ok(r) => RResult {
                randomness: r,
                stderr: "".to_string(),
            },
            Err(e) => RResult {
                randomness: Randomness::empty(),
                stderr: e.to_string(),
            },
        },
        Err(e) => RResult {
            randomness: Randomness::empty(),
            stderr: e.to_string(),
        },
    }
}

#[marine]
pub fn latest(url: String, chain_hash: String) -> RResult {
    let url = format!("{}/{}/public/latest", url, chain_hash);
    randomness(url)
}

#[marine]
pub fn round(url: String, chain_hash: String, round: u64) -> RResult {
    let url = format!("{}/{}/public/{}", url, chain_hash, round);
    randomness(url)
}

#[marine]
pub fn verify_bls(pk: String, round: u64, prev_signature: String, signature: String) -> VResult {
    let hex_pk: [u8; 48] = hex::decode(&pk).unwrap().as_slice().try_into().unwrap();
    let pk = g1_from_fixed(hex_pk).unwrap();

    println!("about to match verify");

    let hex_sig = hex::decode(signature).unwrap();
    let hex_psig = hex::decode(prev_signature).unwrap();

    match verify(&pk, round, &hex_psig, &hex_sig) {
        Err(err) => VResult {
            stderr: format!("Error during verification: {}", err),
            verified: false,
            randomness: "".to_string(),
        },
        Ok(valid) => {
            println!("ok verify");
            if valid {
                // println!("Verification succeeded");
                let randomness = derive_randomness(&hex_sig);
                // println!("Randomness: {}", hex::encode(&randomness));
                VResult {
                    verified: valid,
                    randomness: hex::encode(&randomness),
                    stderr: "".to_string(),
                }
            } else {
                VResult {
                    verified: false,
                    randomness: "".to_string(),
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
    use marine_rs_sdk_test::marine_test;

    const URL: &'static str = "https://api.drand.sh";

    #[marine_test(
        config_path = "../../configs/Config.toml",
        modules_dir = "../../artifacts"
    )]
    fn test_chain(drand: marine_test_env::drand::ModuleInterface) {
        let c_obj = drand.chains(URL.to_string());
        assert_eq!(c_obj.stderr.len(), 0);
        assert!(c_obj.chains.len() > 0);
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
    /*
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
    */
}
