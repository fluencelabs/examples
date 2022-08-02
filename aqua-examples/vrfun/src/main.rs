use std::convert::TryInto;

use ecvrf::{keygen, prove, verify, VrfPk, VrfProof, VrfSk};
//  https://docs.rs/ecvrf/0.4.3/src/ecvrf/lib.rs.html#32
use marine_rs_sdk::{marine, module_manifest, WasmLoggerBuilder};
use zeroize::Zeroize;

module_manifest!();

pub fn main() {
    WasmLoggerBuilder::new().build().unwrap();
}

#[marine]
pub struct ProofResult {
    pub pk: Vec<u8>,
    pub proof: Vec<u8>,
    pub output: Vec<u8>,
    pub stderr: String,
}
#[marine]
pub struct VerificationResult {
    pub verified: bool,
    pub stderr: String,
}

#[marine]
#[derive(Default, Debug)]
pub struct KeyPair {
    pub pk: Vec<u8>,
    pub sk: Vec<u8>,
}

#[marine]
// #[derive(Default)]
pub fn gen_keys() -> KeyPair {
    let (sk, pk) = keygen();

    KeyPair {
        pk: pk.to_bytes().to_vec(),
        sk: sk.to_bytes().to_vec(),
    }
}

fn err_func(e: &str) -> ProofResult {
    ProofResult {
        pk: vec![],
        proof: vec![],
        output: vec![],
        stderr: format!("failed to process {}", e),
    }
}

#[marine]
fn vrf_proof(payload: Vec<u8>, sk: &Vec<u8>) -> ProofResult {
    let mut keys: KeyPair = Default::default();
    let mut _sk: [u8; 32] = Default::default();

    if sk.len() == 0 {
        keys = gen_keys();
        _sk = match keys.sk.try_into() {
            Ok(sk) => sk,
            Err(e) => {
                let s = std::str::from_utf8(&e).expect("failed to generate sk");
                return err_func(s);
            }
        }
    } else {
        _sk = match sk[..].try_into() {
            Ok(sk) => sk,
            Err(e) => {
                return ProofResult {
                    pk: vec![],
                    proof: vec![],
                    output: vec![],
                    stderr: e.to_string(),
                };
            }
        };
        let t_sk: VrfSk = match VrfSk::from_bytes(&_sk) {
            Ok(sk) => sk,
            Err(e) => {
                return ProofResult {
                    pk: vec![],
                    proof: vec![],
                    output: vec![],
                    stderr: e.to_string(),
                };
            }
        };

        let _pk: VrfPk = VrfPk::new(&t_sk);
        keys.pk = _pk.to_bytes().to_vec();
    }

    let (output, proof) = prove(&payload, &VrfSk::from_bytes(&_sk).unwrap());
    _sk.zeroize();

    ProofResult {
        pk: keys.pk,
        proof: proof.to_bytes().to_vec(),
        output: output.to_vec(),
        stderr: "".to_string(),
    }
}

#[marine]
fn verify_vrf(
    pk: Vec<u8>,
    payload: Vec<u8>,
    output: Vec<u8>,
    proof: Vec<u8>,
) -> VerificationResult {
    let mut error: &str;

    let b_pk = match pk[..].try_into() {
        Ok(r) => match VrfPk::from_bytes(r) {
            Ok(r) => r,
            Err(e) => {
                return VerificationResult {
                    verified: false,
                    stderr: format!("pk from bytes error: {}", e),
                };
            }
        },
        Err(e) => {
            return VerificationResult {
                verified: false,
                stderr: format!("pk error: {}", e),
            };
        }
    };

    let b_output: [u8; 32] = match output[..].try_into() {
        Ok(r) => r,
        Err(e) => {
            return VerificationResult {
                verified: false,
                stderr: format!("output error: {}", e),
            }
        }
    };

    let b_proof: [u8; 96] = match proof[..].try_into() {
        Ok(r) => r,
        Err(e) => {
            return VerificationResult {
                verified: false,
                stderr: format!("proof error: {}", e),
            }
        }
    };

    let proof_from_bytes = match VrfProof::from_bytes(&b_proof) {
        Ok(r) => r,
        Err(e) => {
            return VerificationResult {
                verified: false,
                stderr: format!("proof error: {}", e),
            };
        }
    };

    let verified = verify(&payload, &b_pk, &b_output, &proof_from_bytes);

    VerificationResult {
        verified,
        stderr: "".to_string(),
    }
}

#[cfg(test)]
mod tests {
    use marine_rs_sdk_test::marine_test;

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn t_key_gen(vrfun: marine_test_env::vrfun::ModuleInterface) {
        let keys = vrfun.gen_keys();
        assert_eq!(keys.pk.len(), 32);
        assert_eq!(keys.sk.len(), 32);
    }

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn test_proof_module(vrfun: marine_test_env::vrfun::ModuleInterface) {
        let payload = vec![0xde, 0xad, 0xbe, 0xef];
        let result = vrfun.vrf_proof(payload.clone(), vec![]);

        assert_eq!(result.pk.len(), 32);
        assert_eq!(result.output.len(), 32);
        assert_eq!(result.proof.len(), 96);
    }

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn verify_proof_module_no_sk(vrfun: marine_test_env::vrfun::ModuleInterface) {
        let payload = vec![0xde, 0xad, 0xbe, 0xef];
        let result = vrfun.vrf_proof(payload.clone(), vec![]);

        let verified = vrfun.verify_vrf(
            result.pk.clone().to_vec(),
            payload.clone().to_vec(),
            result.output.clone().to_vec(),
            result.proof.clone().to_vec(),
        );

        assert_eq!(verified.stderr, "".to_string());
        assert!(verified.verified);

        let bad_payload = vec![0xde, 0xad, 0xbe, 0xed];
        let verified = vrfun.verify_vrf(result.pk, bad_payload, result.output, result.proof);
        assert!(!verified.verified);
    }

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn verify_proof_module_with_sk(vrfun: marine_test_env::vrfun::ModuleInterface) {
        // let payload = vec![0xde, 0xad, 0xbe, 0xef];
        let payload = vec![222, 173, 190, 239];
        let keypair = vrfun.gen_keys();

        let result = vrfun.vrf_proof(payload.clone(), keypair.sk.clone());
        assert_eq!(&keypair.pk, &result.pk);

        let verified = vrfun.verify_vrf(
            result.pk.clone(),
            payload,
            result.output.clone(),
            result.proof.clone(),
        );
        assert_eq!(verified.stderr, "".to_string());
        assert!(verified.verified);

        let bad_payload = vec![0xde, 0xad, 0xbe, 0xed];
        let verified = vrfun.verify_vrf(
            result.pk.to_vec(),
            bad_payload.to_vec(),
            result.output.to_vec(),
            result.proof.to_vec(),
        );
        assert!(!verified.verified);
    }
}
