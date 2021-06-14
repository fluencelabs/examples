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
use fluence::{marine, module_manifest, WasmLoggerBuilder};
use std::collections::HashMap;

module_manifest!();

pub fn main() {
    WasmLoggerBuilder::new().build().unwrap();
}

fn mode(data: &Vec<u64>) -> (u32, u64) {
    let frequencies = data
        .into_iter()
        .fold(HashMap::<u64, u32>::new(), |mut freqs, value| {
            *freqs.entry(*value).or_insert(0) += 1;
            freqs
        });

    let mode = frequencies
        .clone()
        .into_iter()
        .max_by_key(|&(_, count)| count)
        .map(|(value, _)| value)
        .unwrap();

    (*frequencies.get(&mode).unwrap(), mode)
}

#[marine]
#[derive(Default, Debug)]
pub struct Oracle {
    pub n: u32,
    pub mode: u64,
    pub freq: u32,
    pub err_str: String,
}

#[marine]
pub fn point_estimate(tstamps: Vec<u64>, min_points: u32) -> Oracle {
    if tstamps.len() < min_points as usize {
        return Oracle {
            err_str: format!(
                "Expected at least {} points but onl got {}",
                min_points,
                tstamps.len()
            ),
            ..<_>::default()
        };
    }

    if tstamps.len() < 1 {
        return Oracle {
            err_str: format!("Expected at least one point but onl got none"),
            ..<_>::default()
        };
    }

    let (freq, mode) = mode(&tstamps);

    Oracle {
        n: tstamps.len() as u32,
        mode,
        freq,
        ..<_>::default()
    }
}

// To run tests:
// cargo test --release
// Since the unit tests are using the wasm module via the marine_test crate import
// the modules and Config.toml need to exist. That is, run ./build.sh before you run cargo test.
// Moreover, the test function(s) need to be prefixed by the wasm module namespace, which
// generally is derived from the project name.
// if you name the project "greeting", e.g., cargo generate -g https:// ... --name greeting
// the unit test can be executed as is. If not, the project needs to replace the "greeting"
// reference in place
// if
// cargo generate -g https:// ... --name project-name
// then
// let res = project_name.greeting(name.to_string());
#[cfg(test)]
mod tests {
    use fluence_test::marine_test;

    #[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts")]
    fn test_greeting() {
        let name = "Marine";
        let res = greeting.greeting(name.to_string());
        assert_eq!(res, format!("Hi, {}", name));
    }
}
