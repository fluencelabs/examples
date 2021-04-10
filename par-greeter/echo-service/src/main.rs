use fluence::fce;

#[fce]
pub struct Echo {
    pub echo: String,
}

#[fce]
pub fn echo(inputs: Vec<String>) -> Vec<Echo> {
    inputs
        .iter()
        .map(|s| Echo {
            echo: s.to_string(),
        })
        .collect()
}

fn main() {}
