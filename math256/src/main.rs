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
mod math;
mod result;
#[cfg(test)]
mod tests;

use result::MathResult;

use fluence::module_manifest;

module_manifest!();

pub fn main() {}

use fluence::marine;

/// Adds two 256 bits integers (ETH compatible).
/// Returns number or error (failed to parse input or overflow of output).
#[marine]
pub fn add(lhs: String, rhs: String) -> MathResult {
    math::add(lhs, rhs).into()
}

/// Subtracts two 256 bits integers (ETH compatible).
/// Returns number or error (failed to parse input or underflow of output).
#[marine]
pub fn sub(lhs: String, rhs: String) -> MathResult {
    math::sub(lhs, rhs).into()
}

/// Multiplies two 256 bits integers (ETH compatible).
/// Returns number or error (failed to parse input or overflow of output).
#[marine]
pub fn mul(lhs: String, rhs: String) -> MathResult {
    math::mul(lhs, rhs).into()
}

/// Divides 256 bits integer by other (ETH compatible).
/// Returns number or error (failed to parse input or division by zero).
#[marine]
pub fn div(lhs: String, rhs: String) -> MathResult {
    math::div(lhs, rhs).into()
}
