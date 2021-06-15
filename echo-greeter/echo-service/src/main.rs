use marine_rs_sdk::marine;

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
