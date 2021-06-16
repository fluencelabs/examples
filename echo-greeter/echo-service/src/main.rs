use marine_rs_sdk::marine;
use marine_rs_sdk::module_manifest;

module_manifest!();

#[marine]
pub struct Echo {
    pub echo: String,
}

#[marine]
pub fn echo(inputs: Vec<String>) -> Vec<Echo> {
    inputs
        .iter()
        .map(|s| Echo {
            echo: s.to_string(),
        })
        .collect()
}

fn main() {}
