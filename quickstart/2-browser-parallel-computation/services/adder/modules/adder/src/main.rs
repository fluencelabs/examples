use marine_rs_sdk::marine;

pub fn main() {}

#[marine]
pub fn add_one(value: u64) -> u64 {
    value + 1
}
