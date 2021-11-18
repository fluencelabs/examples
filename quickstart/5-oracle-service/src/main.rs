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
// use picorand::{PicoRandGenerate, WyRand, RNG};
use nanorand::{Rng, WyRand};

module_manifest!();

pub fn main() {
    WasmLoggerBuilder::new().build().unwrap();
}

#[marine]
#[derive(Default, Debug)]
pub struct Oracle {
    pub n: u32,
    pub avg: f64,
    pub err_str: String,
}
#[marine]
#[derive(Default, Debug)]
pub struct Consensus {
    pub n: u32,
    pub consensus_ts: u64,
    pub consensus: bool,
    pub support: u32,
    pub err_str: String,
}

#[marine]
pub fn ts_avg(timestamps: Vec<u64>, min_points: u32) -> Oracle {
    if min_points as usize == 0 {
        let err_str = "Need to process at least one point".to_string();
        return Oracle {
            err_str,
            n: timestamps.len() as u32,
            ..<_>::default()
        };
    }

    if timestamps.len() < min_points as usize {
        return Oracle {
            err_str: format!(
                "Expected at least {} points but only got {}.",
                min_points,
                timestamps.len(),
            ),
            n: timestamps.len() as u32,
            ..<_>::default()
        };
    }
    let avg = timestamps.iter().sum::<u64>() as f64 / timestamps.len() as f64;
    Oracle {
        n: timestamps.len() as u32,
        avg,
        ..<_>::default()
    }
}

#[marine]
fn ts_frequency(mut timestamps: Vec<u64>, tolerance: u32, threshold: f64) -> Consensus {
    if timestamps.len() == 0 {
        return Consensus {
            err_str: "Array must have at least one element".to_string(),
            ..<_>::default()
        };
    }
    if timestamps.len() == 1 {
        return Consensus {
            n: 1,
            consensus_ts: timestamps[0],
            consensus: true,
            support: 1,
            ..<_>::default()
        };
    }

    if threshold < 0f64 || threshold > 1f64 {
        return Consensus {
            err_str: "Threshold needs to be between [0.0,1.0]".to_string(),
            ..<_>::default()
        };
    }

    let rnd_seed: u64 = timestamps.iter().sum();
    let mut rng = WyRand::new_seed(rnd_seed);
    let rnd_idx = rng.generate_range(0..timestamps.len());
    let consensus_ts = timestamps.swap_remove(rnd_idx);
    let mut support: u32 = 0;
    for ts in timestamps.iter() {
        if ts <= &(consensus_ts + tolerance as u64) && ts >= &(consensus_ts - tolerance as u64) {
            support += 1;
        }
    }

    let mut consensus = false;
    if (support as f64 / timestamps.len() as f64) >= threshold {
        consensus = true;
    }

    Consensus {
        n: timestamps.len() as u32,
        consensus_ts,
        consensus,
        support,
        err_str: "".to_string(),
    }
}

#[cfg(test)]
mod tests {
    use marine_rs_sdk_test::marine_test;

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn test_mean_good(ts_consensus: marine_test_env::ts_oracle::ModuleInterface) {
        let data = vec![1u64, 2u64, 3u64];
        let n = 3;
        let res = ts_consensus.ts_avg(data, n);
        assert_eq!(res.avg, 2f64);
        assert_eq!(res.err_str.len(), 0)
    }

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn test_mean_fails(ts_consensus: marine_test_env::ts_oracle::ModuleInterface) {
        let data = vec![1u64, 2u64, 3u64];
        let n = 0;
        let res = ts_consensus.ts_avg(data, n);
        assert_eq!(
            res.err_str,
            "Need to process at least one point".to_string()
        );

        let data = vec![1u64];
        let n = 3;
        let res = ts_consensus.ts_avg(data, n);
        assert!(res.err_str.contains("Expected at least"));
    }

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn ts_validation_good_consensus(ts_consensus: marine_test_env::ts_oracle::ModuleInterface) {
        let data = vec![
            1636961969u64,
            1636961970u64,
            1636961969u64,
            1636961968u64,
            1636961969u64,
            1636961971u64,
        ];
        let tolerance = 3u32;
        let threshold: f64 = 0.66;
        let res = ts_consensus.ts_frequency(data.clone(), tolerance, threshold);
        assert_eq!(res.n, (data.len() - 1) as u32);
        assert_eq!(res.support, (data.len() - 1) as u32);
        assert_eq!(res.err_str.len(), 0);
        assert!(res.consensus);
        assert!(data.contains(&res.consensus_ts));
    }
    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn ts_validation_good_no_support(ts_consensus: marine_test_env::ts_oracle::ModuleInterface) {
        let data = vec![
            1636961969u64,
            1636961970u64,
            1636961969u64,
            1636961968u64,
            1636961969u64,
            1636961971u64,
        ];
        let tolerance = 0u32;
        let threshold: f64 = 0.66;
        let res = ts_consensus.ts_frequency(data.clone(), tolerance, threshold);
        assert_eq!(res.n, (data.len() - 1) as u32);
        assert_eq!(res.support, 0u32);
        assert_eq!(res.err_str.len(), 0);
        assert!(data.contains(&res.consensus_ts));
    }

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn ts_validation_good_consensus_true(
        ts_consensus: marine_test_env::ts_oracle::ModuleInterface,
    ) {
        let data = vec![
            1636961969u64,
            1636961970u64,
            1636961969u64,
            1636961968u64,
            1636961969u64,
            1636961969u64,
            1636961971u64,
        ];
        let tolerance = 3u32;
        let threshold: f64 = 0.66;
        let res = ts_consensus.ts_frequency(data.clone(), tolerance, threshold);
        assert_eq!(res.n, (data.len() - 1) as u32);
        assert_eq!(res.support, (data.len() - 1) as u32);
        assert_eq!(res.err_str.len(), 0);
        assert!(data.contains(&res.consensus_ts));
    }

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn ts_validation_good_consensus_false(
        ts_consensus: marine_test_env::ts_oracle::ModuleInterface,
    ) {
        let data = vec![
            1636961969u64,
            1636961970u64,
            1636961969u64,
            1636961968u64,
            1636961969u64,
            1636961971u64,
        ];
        let tolerance = 0u32;
        let threshold: f64 = 0.66;
        let res = ts_consensus.ts_frequency(data.clone(), tolerance, threshold);
        assert_eq!(res.n, (data.len() - 1) as u32);
        assert_eq!(res.support, 0u32);
        assert_eq!(res.err_str.len(), 0);
        assert!(!res.consensus);
        assert!(data.contains(&res.consensus_ts));
    }

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn ts_validation_good_no_consensus(ts_consensus: marine_test_env::ts_oracle::ModuleInterface) {
        let data = vec![1636961965u64, 1636961969u64, 1636961972u64];
        let tolerance = 1u32;
        let threshold: f64 = 0.66;
        let res = ts_consensus.ts_frequency(data.clone(), tolerance, threshold);
        assert_eq!(res.n, (data.len() - 1) as u32);
        assert_eq!(res.support, 0 as u32);
        assert_eq!(res.err_str.len(), 0);
        assert!(data.contains(&res.consensus_ts));
    }

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn ts_validation_good_one(ts_consensus: marine_test_env::ts_oracle::ModuleInterface) {
        let data = vec![1636961969u64];
        let tolerance = 3u32;
        let threshold: f64 = 0.66;
        let res = ts_consensus.ts_frequency(data.clone(), tolerance, threshold);
        assert_eq!(res.consensus_ts, data[0]);
        assert_eq!(res.support, data.len() as u32);
        assert_eq!(res.n, data.len() as u32);
        assert_eq!(res.err_str.len(), 0usize);
    }

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn ts_validation_bad_empty(ts_consensus: marine_test_env::ts_oracle::ModuleInterface) {
        let data = vec![];
        let tolerance = 3u32;
        let threshold: f64 = 0.66;
        let res = ts_consensus.ts_frequency(data, tolerance, threshold);
        assert_eq!(res.n, 0);
        assert_eq!(res.support, 0);
        assert_eq!(res.consensus_ts, 0);
        assert_eq!(
            res.err_str,
            "Array must have at least one element".to_string()
        );
    }
}
