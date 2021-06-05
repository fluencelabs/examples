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

pub fn add(lhs: String, rhs: String) -> Result<u256, Error> {
    let lhs = lhs.parse::<u256>().map_err(|_| Error::ParseError)?;
    let rhs = rhs.parse::<u256>().map_err(|_| Error::ParseError)?;
    let result = lhs.checked_add(rhs).ok_or_else(|| Error::Overflow)?;
    Ok(result)
}

pub fn sub(lhs: String, rhs: String) -> Result<u256, Error> {
    let lhs = lhs.parse::<u256>().map_err(|_| Error::ParseError)?;
    let rhs = rhs.parse::<u256>().map_err(|_| Error::ParseError)?;
    let result = lhs.checked_sub(rhs).ok_or_else(|| Error::Underflow)?;
    Ok(result)
}

pub fn mul(lhs: String, rhs: String) -> Result<u256, Error> {
    let lhs = lhs.parse::<u256>().map_err(|_| Error::ParseError)?;
    let rhs = rhs.parse::<u256>().map_err(|_| Error::ParseError)?;
    let result = lhs.checked_mul(rhs).ok_or_else(|| Error::Overflow)?;
    Ok(result)
}

pub fn div(lhs: String, rhs: String) -> Result<u256, Error> {
    let lhs = lhs.parse::<u256>().map_err(|_| Error::ParseError)?;
    let rhs = rhs.parse::<u256>().map_err(|_| Error::ParseError)?;
    let result = lhs.checked_div(rhs).ok_or_else(|| Error::DivisionByZero)?;
    Ok(result)
}
