use marine_rs_sdk::marine;
use serde_json::Value;
use web3::types::Bytes;
use web3::types::U64;

#[marine]
pub struct JsonString {
    pub value: String,
    pub success: bool,
    pub error: String,
}

impl From<eyre::Result<Value>> for JsonString {
    fn from(value: eyre::Result<Value>) -> Self {
        match value {
            Ok(value) => JsonString {
                value: value.to_string(),
                success: true,
                error: String::new(),
            },
            Err(err) => JsonString {
                value: String::new(),
                success: false,
                error: format!("{}\n{:?}", err, err),
            },
        }
    }
}

#[marine]
pub struct U64Value {
    pub value: u64,
    pub success: bool,
    pub error: String,
}

impl From<web3::error::Result<U64>> for U64Value {
    fn from(value: web3::error::Result<U64>) -> Self {
        match value {
            Ok(value) => U64Value {
                value: value.as_u64(),
                success: true,
                error: String::new(),
            },
            Err(err) => U64Value {
                value: u64::default(),
                success: false,
                error: format!("{}\n{:?}", err, err),
            },
        }
    }
}

#[marine]
pub struct BytesValue {
    pub value: Vec<u8>,
    pub success: bool,
    pub error: String,
}

impl From<eyre::Result<Bytes>> for BytesValue {
    fn from(value: eyre::Result<Bytes>) -> Self {
        match value {
            Ok(value) => BytesValue {
                value: value.0,
                success: true,
                error: String::new(),
            },
            Err(err) => BytesValue {
                value: vec![],
                success: false,
                error: format!("{}\n{:?}", err, err),
            },
        }
    }
}
