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

use crate::errors::U256Error;

use ethnum::u256;
use fluence::marine;

#[marine]
#[derive(Default, Debug)]
pub struct U256Result {
    /// u256 string representation
    pub value: String,
    pub ret_code: u8,
    /// contains error as a string
    pub err_msg: String,
}

impl U256Result {
    pub(crate) fn from_u256(value: u256) -> Self {
        Self {
            value: value.to_string(),
            ret_code: 0, // 0 means success
            err_msg: <_>::default(),
        }
    }
}

impl From<U256Error> for U256Result {
    fn from(e: U256Error) -> Self {
        let ret_code = match e {
            U256Error::ParseError(_) => 1,
            U256Error::U256Overflow => 2,
        };

        Self {
            ret_code,
            err_msg: e.to_string(),
            ..<_>::default()
        }
    }
}
