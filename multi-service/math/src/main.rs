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

use ethnum::*;
use fluence::marine;
use fluence::module_manifest;

module_manifest!();

pub fn main() {}

/// adds 2 256 bits integers (ETH compatible)
/// return number or error (failed to parse input or overflow of output)
#[marine]
pub fn add_u256(number_1: String, number_2: String) -> String {
    let number_1 = number_1.parse::<u256>();
    let number_2 = number_2.parse::<u256>();
    if let (Ok(number_1), Ok(number_2)) = (number_1, number_2) {
        let number = number_1.checked_add(number_2);
        if let Some(number) = number {
            return number.to_string();
        }

        return "Overflow".to_string();
    }

    "InputNonAU256Number".to_string()
}

#[marine]
pub fn sub_u256(number_1: String, number_2: String) -> String {
    let number_1 = number_1.parse::<u256>();
    let number_2 = number_2.parse::<u256>();
    if let (Ok(number_1), Ok(number_2)) = (number_1, number_2) {
        let number = number_1.checked_sub(number_2);
        if let Some(number) = number {
            return number.to_string();
        }

        return "Underflow".to_string();
    }

    "InputNonAU256Number".to_string()
}

#[marine]
pub fn mul_u256(number_1: String, number_2: String) -> String {
    let number_1 = number_1.parse::<u256>();
    let number_2 = number_2.parse::<u256>();
    if let (Ok(number_1), Ok(number_2)) = (number_1, number_2) {
        let number = number_1.checked_mul(number_2);
        if let Some(number) = number {
            return number.to_string();
        }

        return "Overflow".to_string();
    }

    "InputNonAU256Number".to_string()
}

#[marine]
pub fn div_u256(number_1: String, number_2: String) -> String {
    let number_1 = number_1.parse::<u256>();
    let number_2 = number_2.parse::<u256>();
    if let (Ok(number_1), Ok(number_2)) = (number_1, number_2) {
        let number = number_1.checked_div(number_2);
        if let Some(number) = number {
            return number.to_string();
        }

        return "DivisionByZero".to_string();
    }

    "InputNonAU256Number".to_string()
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
