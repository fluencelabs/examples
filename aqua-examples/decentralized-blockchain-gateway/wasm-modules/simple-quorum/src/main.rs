/*
 * Copyright 2022 Fluence Labs Limited
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
use std::collections::HashMap;

module_manifest!();

fn main() {}

// very simple mode calculator with much room for improvement
// see https://github.com/BurntSushi/rust-stats for inspiration
fn mode<'a>(data: impl ExactSizeIterator<Item = &'a EVMResult>) -> (u32, u64) {
    let frequencies = data
        .into_iter()
        .fold(HashMap::<u64, u32>::new(), |mut freqs, value| {
            *freqs
                .entry(
                    match serde_json::from_str::<serde_json::Value>(&value.stdout) {
                        Ok(r) => r["block-height"].as_u64().unwrap(),
                        Err(_e) => 0 as u64,
                    },
                )
                .or_insert(0) += 1;
            freqs
        });

    let mode = frequencies
        .iter()
        .max_by_key(|&(_, count)| count)
        .map(|(value, _)| value)
        .unwrap();

    (*frequencies.get(&mode).unwrap(), *mode)
}

fn mean<'a>(data: impl ExactSizeIterator<Item = &'a u64>) -> Option<f64> {
    let n = data.len() as u64;
    if n < 1 {
        return None;
    }
    let res = (data.sum::<u64>() / n) as f64;
    Some(res)
}

#[marine]
pub struct EVMResult {
    pub provider: String,
    pub stdout: String,
    pub stderr: String,
}

#[marine]
#[derive(Default, Debug)]
pub struct Quorum {
    pub n: u32,
    pub mode: u64,
    pub freq: u32,
    pub err_str: String,
}

#[marine]
pub fn point_estimate(data: Vec<EVMResult>, min_points: u32) -> Quorum {
    if data.len() < min_points as usize {
        return Quorum {
            err_str: format!(
                "Expected at least {} points but only got {}.",
                min_points,
                data.len()
            ),
            ..<_>::default()
        };
    }

    if data.len() < 1 {
        return Quorum {
            err_str: format!("Expected at least one timestamp."),
            ..<_>::default()
        };
    }

    let (freq, mode) = mode(data.iter());

    Quorum {
        n: data.len() as u32,
        mode,
        freq,
        ..<_>::default()
    }
}

#[marine]
pub fn int_div(nom: u64, denom: u64) -> f64 {
    nom as f64 / denom as f64
}

#[marine]
pub fn is_quorum(nom: u64, denom: u64, threshold: f64) -> bool {
    let div = nom as f64 / denom as f64;
    if div >= threshold {
        return true;
    }
    false
}
