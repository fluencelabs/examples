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

use marine_rs_sdk::{marine, module_manifest, WasmLoggerBuilder};

module_manifest!();

pub fn main() {
    WasmLoggerBuilder::new().build().ok();
}

#[marine]
pub fn array_splitter_u64(array: Vec<u64>, chunk_size: u32) -> Vec<Vec<u64>> {
    let mut my_vecs: Vec<Vec<u64>> = Vec::new();
    for chunk in array.chunks(chunk_size as usize) {
        my_vecs.push(chunk.to_vec());
    }
    my_vecs
}

#[marine]
pub fn array_splitter_u32(array: Vec<u32>, chunk_size: u32) -> Vec<Vec<u32>> {
    let mut my_vecs: Vec<Vec<u32>> = Vec::new();
    for chunk in array.chunks(chunk_size as usize) {
        my_vecs.push(chunk.to_vec());
    }
    my_vecs
}

#[marine]
pub struct U64Result {
    pub value: u64,
    pub err_msg: String,
}

#[marine]
pub struct U32Result {
    pub value: u32,
    pub err_msg: String,
}

#[marine]
pub fn crement_u32(value: u32, step: u32, increment: bool) -> U32Result {
    match increment {
        true => U32Result {
            value: value + step,
            err_msg: "".to_string(),
        },
        false => {
            if value < step {
                U32Result {
                    value: 0,
                    err_msg: format!("decrementing to negative value is not allowed"),
                }
            } else {
                U32Result {
                    value: value - step,
                    err_msg: "".to_string(),
                }
            }
        }
    }
}

#[marine]
pub fn crement_u64(value: u64, step: u64, increment: bool) -> U64Result {
    match increment {
        true => U64Result {
            value: value + step,
            err_msg: "".to_string(),
        },
        false => {
            if value < step {
                U64Result {
                    value: 0,
                    err_msg: format!("decrementing to negative value is not allowed"),
                }
            } else {
                U64Result {
                    value: value - step,
                    err_msg: "".to_string(),
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use marine_rs_sdk_test::marine_test;

    #[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts")]
    fn crement_u32_good(utilities: marine_test_env::utilities::ModuleInterface) {
        let value = 10u32;
        let step = 2u32;
        let res = utilities.crement_u32(value, step, false);
        assert_eq!(res.value, 8);

        let value = 10u32;
        let step = 2u32;
        let res = utilities.crement_u32(value, step, true);
        assert_eq!(res.value, 12);
    }

    #[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts")]
    fn crement_u32_fail(utilities: marine_test_env::utilities::ModuleInterface) {
        let value = 0u32;
        let step = 2u32;
        let res = utilities.crement_u32(value, step, false);
        assert!(res.err_msg.len() > 0);
    }

    #[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts")]
    fn crement_u64_good(utilities: marine_test_env::utilities::ModuleInterface) {
        let value = 10u64;
        let step = 2u64;
        let res = utilities.crement_u64(value, step, false);
        assert_eq!(res.value, 8);

        let value = 10u64;
        let step = 2u64;
        let res = utilities.crement_u64(value, step, true);
        assert_eq!(res.value, 12);
    }

    #[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts")]
    fn crement_u64_fail(utilities: marine_test_env::utilities::ModuleInterface) {
        let value = 0u64;
        let step = 2u64;
        let res = utilities.crement_u64(value, step, false);
        assert!(res.err_msg.len() > 0);
    }

    #[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts")]
    fn array_splitter_u64(utilities: marine_test_env::utilities::ModuleInterface) {
        let test_vec: Vec<u64> = vec![1, 2, 3, 4, 5, 6, 7, 8, 9];
        let res = utilities.array_splitter_u64(test_vec, 3);
        assert_eq!(res.len(), 3);
        assert_eq!(res[0], vec![1, 2, 3]);
        assert_eq!(res[1], vec![4, 5, 6]);
        assert_eq!(res[2], vec![7, 8, 9]);

        let test_vec: Vec<u64> = vec![1, 2, 3, 4, 5, 6, 7, 8];
        let res = utilities.array_splitter_u64(test_vec, 3);
        assert_eq!(res.len(), 3);
        assert_eq!(res[0], vec![1, 2, 3]);
        assert_eq!(res[1], vec![4, 5, 6]);
        assert_eq!(res[2], vec![7, 8]);
    }
}
