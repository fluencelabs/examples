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

use marine_rs_sdk::marine;
use marine_rs_sdk::module_manifest;
use marine_rs_sdk::WasmLoggerBuilder;
mod stats;

module_manifest!();

pub fn main() {
    WasmLoggerBuilder::new().build().unwrap();
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
                "Expected at least {} points but only got {}.",
                min_points,
                tstamps.len()
            ),
            ..<_>::default()
        };
    }

    if tstamps.len() < 1 {
        return Oracle {
            err_str: format!("Expected at least one timestamp."),
            ..<_>::default()
        };
    }

    let (freq, mode) = stats::mode(tstamps.iter());

    Oracle {
        n: tstamps.len() as u32,
        mode,
        freq,

        ..<_>::default()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use marine_rs_sdk_test::marine_test;

    #[test]
    fn test_mean_good() {
        let data = vec![1u64, 2u64, 3u64];
        let res = stats::mean(data.iter());
        assert!(res.is_some());
        assert_eq!(res.unwrap(), 2f64)
    }

    #[test]
    fn test_mean_bad() {
        let data = vec![];
        let res = stats::mean(data.iter());
        assert!(res.is_none());
    }

    #[test]
    fn test_mode() {
        let data = vec![1u64, 1u64, 3u64, 3u64, 3u64, 5u64];
        let (freq, mode) = stats::mode(data.iter());
        assert_eq!(mode, 3u64);
        assert_eq!(freq, 3);
    }

    #[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts")]
    fn test_point_estimate_good(ts_oracle: marine_test_env::ts_oracle::ModuleInterface) {
        let data = vec![1u64, 1u64, 3u64, 3u64, 3u64, 5u64];
        let min_points = 2u32;
        let res = ts_oracle.point_estimate(data, min_points);
        assert_eq!(res.mode, 3u64);
        assert_eq!(res.freq, 3u32);
    }

    #[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts")]
    fn test_point_estimate_bad(ts_oracle: marine_test_env::ts_oracle::ModuleInterface) {
        let data = vec![1u64, 1u64, 3u64, 3u64, 3u64, 5u64];
        let n = data.len();
        let min_points = 20u32;
        let res = ts_oracle.point_estimate(data, min_points);
        assert_eq!(
            res.err_str,
            format!(
                "Expected at least {} points but only got {}.",
                min_points, n
            )
        );
    }

    #[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts")]
    fn test_point_estimate_bad_2(ts_oracle: marine_test_env::ts_oracle::ModuleInterface) {
        let data = vec![];
        let n = data.len();
        let min_points = 0u32;
        let res = ts_oracle.point_estimate(data, min_points);
        println!("res: {:?}", res);
        assert_eq!(res.err_str, "Expected at least one timestamp.".to_string());
    }
}
