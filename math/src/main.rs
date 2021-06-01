//! ETH compatible u256 math.

/*
 * Copyright 2021 Fluence Labs Limited
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

#![warn(rust_2018_idioms)]
#![deny(
    dead_code,
    nonstandard_style,
    unused_imports,
    unused_mut,
    unused_variables,
    unused_unsafe,
    unreachable_patterns
)]

mod errors;
mod result;

use errors::U256Error;
use result::U256Result;

use ethnum::u256;
use fluence::marine;
use fluence::module_manifest;

module_manifest!();

pub fn main() {}

use std::convert::identity;
use U256Error::U256Overflow;

/// adds 2 256 bits integers (ETH compatible)
/// return number or error (failed to parse input or overflow of output)
#[marine]
pub fn add_u256(lhs: String, rhs: String) -> U256Result {
    add_u256_impl(lhs, rhs)
        .map_err(Into::into)
        .unwrap_or_else(identity)
}

pub fn add_u256_impl(lhs: String, rhs: String) -> Result<U256Result, U256Error> {
    let lhs = lhs.parse::<u256>()?;
    let rhs = rhs.parse::<u256>()?;
    let result = lhs.checked_add(rhs).ok_or_else(|| U256Overflow)?;

    Ok(U256Result::from_u256(result))
}

#[marine]
pub fn sub_u256(lhs: String, rhs: String) -> U256Result {
    sub_u256_impl(lhs, rhs)
        .map_err(Into::into)
        .unwrap_or_else(identity)
}

pub fn sub_u256_impl(lhs: String, rhs: String) -> Result<U256Result, U256Error> {
    let lhs = lhs.parse::<u256>()?;
    let rhs = rhs.parse::<u256>()?;
    let result = lhs.checked_sub(rhs).ok_or_else(|| U256Overflow)?;

    Ok(U256Result::from_u256(result))
}

#[marine]
pub fn mul_u256(lhs: String, rhs: String) -> U256Result {
    mul_u256_impl(lhs, rhs)
        .map_err(Into::into)
        .unwrap_or_else(identity)
}

pub fn mul_u256_impl(lhs: String, rhs: String) -> Result<U256Result, U256Error> {
    let lhs = lhs.parse::<u256>()?;
    let rhs = rhs.parse::<u256>()?;
    let result = lhs.checked_mul(rhs).ok_or_else(|| U256Overflow)?;

    Ok(U256Result::from_u256(result))
}

#[marine]
pub fn div_u256(lhs: String, rhs: String) -> U256Result {
    div_u256_impl(lhs, rhs)
        .map_err(Into::into)
        .unwrap_or_else(identity)
}

pub fn div_u256_impl(lhs: String, rhs: String) -> Result<U256Result, U256Error> {
    let lhs = lhs.parse::<u256>()?;
    let rhs = rhs.parse::<u256>()?;
    let result = lhs.checked_div(rhs).ok_or_else(|| U256Overflow)?;

    Ok(U256Result::from_u256(result))
}

#[cfg(test)]
mod tests {
    use fluence_test::marine_test;
    #[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts/")]
    fn add_u256() {
        assert_eq!(
            math.add_u256(
                "100000000000000000000000000000000".to_string(),
                "100000000000000000000000000000000".to_string()
            ),
            "200000000000000000000000000000000"
        );
    }
}
