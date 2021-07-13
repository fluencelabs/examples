use blake3;
use libp2p::{identity, PeerId};
use serde_json;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

// 1 minute in millis -- margin +- now for timestamp validation
static TS_DELTA: u32 = 60_000 as u32;

#[derive(Debug)]
struct TSValidator {
    peer_id: String,
    doc_hash: Vec<u8>,
    signed_hash: Vec<u8>,
    node_ts: u128,
    valid: bool,
}

impl TSValidator {
    pub fn create(keypair: identity::Keypair, json_string: String) -> Result<Self, &'static str> {
        let now_utc: u128 = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis();

        let json_doc: serde_json::Value =
            serde_json::from_str(&json_string).expect("Invalid json string");
        if json_doc["timestamp"] == serde_json::Value::Null {
            return Err("Missing timestamp key in json doc");
        }

        let proposed_ts = json_doc["timestamp"].as_u64().unwrap() as u128;

        let peer_id = keypair.public().into_peer_id().to_base58();
        let doc_hash = blake3::hash(&json_string.as_bytes());
        let signed_hash = keypair.sign(doc_hash.as_bytes()).unwrap();

        let valid_proposal = Self::ts_validator(proposed_ts, now_utc, TS_DELTA).unwrap();

        let res = TSValidator {
            peer_id,
            doc_hash: doc_hash.as_bytes().to_vec(),
            signed_hash,
            node_ts: now_utc,
            valid: valid_proposal,
        };

        Ok(res)
    }

    fn ts_validator(proposed_ts: u128, now_ts: u128, ts_delta: u32) -> Result<bool, &'static str> {
        let lower_threshold = now_ts - ts_delta as u128;
        let upper_threshold = now_ts + ts_delta as u128;
        if lower_threshold <= proposed_ts && proposed_ts <= upper_threshold {
            return Ok(true);
        } else {
            Ok(false)
        }
    }
}

fn main() {
    println!("hello signing builtin wip");
    let now_utc: u128 = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis();
    let json_string = serde_json::json!({ "timestamp": now_utc as u64 }).to_string();
    println!("json string: {}", json_string);

    let keypair = identity::Keypair::generate_secp256k1();

    let res = TSValidator::create(keypair, json_string);

    println!("res: {:?}", res);
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_validate_good() {
        assert!(true);
        let now_utc: u128 = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis();
        let json_string = serde_json::json!({ "timestamp": now_utc as u64 }).to_string();

        let keypair = identity::Keypair::generate_secp256k1();

        let res = TSValidator::create(keypair.clone(), json_string.clone());

        assert!(res.is_ok());
        let res = res.unwrap();
        assert!(res.valid);

        let doc_hash = blake3::hash(&json_string.as_bytes());
        let verified = keypair
            .public()
            .verify(doc_hash.as_bytes(), &res.signed_hash);
        assert!(verified);
    }

    #[test]
    fn test_validate_bad_proposal() {
        assert!(true);
        let now_utc: u128 = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis();

        let too_old_utc = now_utc - (2 * TS_DELTA) as u128;
        let too_new_utc = now_utc + (2 * TS_DELTA) as u128;

        let keypair = identity::Keypair::generate_secp256k1();

        let json_string = serde_json::json!({ "timestamp": too_old_utc as u64 }).to_string();
        let res = TSValidator::create(keypair.clone(), json_string);
        assert!(res.is_ok());
        let res = res.unwrap();
        assert!(!res.valid);

        let json_string = serde_json::json!({ "timestamp": too_new_utc as u64 }).to_string();
        let res = TSValidator::create(keypair, json_string);
        assert!(res.is_ok());
        let res = res.unwrap();
        assert!(!res.valid);
    }

    #[test]
    fn test_validate_missing_timestamp() {
        assert!(true);
        let now_utc: u128 = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis();
        let json_string = serde_json::json!({ "time-stamp": now_utc as u64 }).to_string();

        let keypair = identity::Keypair::generate_secp256k1();

        let res = TSValidator::create(keypair, json_string);

        assert!(res.is_err());
    }
}
