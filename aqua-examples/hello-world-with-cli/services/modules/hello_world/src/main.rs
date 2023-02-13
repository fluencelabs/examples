#![allow(non_snake_case)]
use marine_rs_sdk::marine;
use marine_rs_sdk::module_manifest;

module_manifest!();

pub fn main() {}


#[marine]
pub fn hello_world() -> String {
    format!("Hi, World")
}

#[marine]
pub fn hello_fluence() -> String {
    format!("Hi, Fluence")
}
