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

use crate::errors::Error;
use ethnum::u256;
use fluence::marine;
use num_traits::ToPrimitive;

#[marine]
#[derive(Default, Debug)]
pub struct MathResult {
    /// u256 string representation
    pub value: String,
    // 0 means success
    pub ret_code: u8,
    /// contains error as a string
    pub err_msg: String,
}

impl From<std::result::Result<u256, Error>> for MathResult {
    fn from(result: std::result::Result<u256, Error>) -> Self {
        match result {
            Ok(ok) => MathResult {
                value: ok.to_string(),
                ..<_>::default()
            },
            Err(err) => MathResult {
                ret_code: err.to_u8().unwrap(),
                err_msg: err.to_string(),
                ..<_>::default()
            },
        }
    }
}
