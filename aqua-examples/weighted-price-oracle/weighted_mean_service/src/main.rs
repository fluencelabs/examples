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
use marine_rs_sdk::{marine, module_manifest};

module_manifest!();

fn main() {}

#[marine]
pub struct Result {
    pub result: f64,
    pub success: bool,
    pub error_msg: String,
}

#[marine]
pub fn weighted_mean(data: Vec<f64>, weights: Vec<u32>) -> Result {
    match calc_weighted_mean(data.iter(), weights.iter()) {
        Some(res) => Result {
            result: res,
            success: true,
            error_msg: "".to_string(),
        },
        None => Result {
            result: -1f64,
            success: false,
            error_msg: "Failure to calculate mean. Check your inputs.".to_string(),
        },
    }
}

fn calc_weighted_mean<'a>(data: impl ExactSizeIterator<Item = &'a f64>, weights: impl ExactSizeIterator<Item = &'a u32>) -> Option<f64> {
    let n = data.len();
    if n < 1 || n != weights.len() {
        return None;
    }

    let mut weights_sum = 0u32;
    let res = data.zip(weights).map(|(&a, &b)| { weights_sum += b; a * b as f64}).sum::<f64>() / weights_sum as f64;
    let res = format!("{:.2}", res).parse::<f64>().unwrap();
    Some(res)
}
