use marine_rs_sdk::marine;
use serde_json::Value;

#[marine]
pub struct JsonString {
    value: String,
    success: bool,
    error: String
}

impl From<eyre::Result<Value>> for JsonString {
    fn from(value: eyre::Result<Value>) -> Self {
        match value {
            Ok(value) => JsonString {
                value: value.to_string(),
                success: true,
                error: String::new()
            },
            Err(err) => JsonString {
                value: String::new(),
                success: false,
                error: format!("{}\n{:?}", err, err)
            }
        }
    }
}