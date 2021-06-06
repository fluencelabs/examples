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

use fluence_test::marine_test;
use wasm_math256::*;

#[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts/")]
fn add_test() {
    assert_eq!(
        add(
            "1000000000000000000000000000000000".to_string(),
            "1000000000000000000000000000000000".to_string()
        )
        .value,
        "2000000000000000000000000000000000"
    );
}

#[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts/")]
fn sub_test() {
    assert_eq!(
        sub(
            "1000000000000000000000000000000000".to_string(),
            "1000000000000000000000000000000000".to_string()
        )
        .value,
        "0"
    );
}

#[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts/")]
fn div_test() {
    assert_eq!(
        div(
            "1000000000000000000000000000000000".to_string(),
            "1000000000000000000000000000000000".to_string()
        )
        .value,
        "1"
    );
}

#[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts/")]
fn mul_test() {
    assert_eq!(
        mul(
            "1000000000000000000000000000000000".to_string(),
            "1000000000000000000000000000000000".to_string()
        )
        .value,
        "1000000000000000000000000000000000000000000000000000000000000000000"
    );
}

#[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts/")]
fn mul_oveflow_test() {
    assert_eq!(
        mul(
            "100000000000000000000000000000000000000000000000000000".to_string(),
            "100000000000000000000000000000000000000000000000000000".to_string()
        )
        .ret_code,
        1
    );
}

#[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts/")]
fn add_oveflow_test() {
    let max = ethnum::u256::MAX.to_string();
    assert_eq!(add(max, "100".to_string(),).ret_code, 1);
}

#[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts/")]
fn mul_underlow_test() {
    assert_eq!(sub("1".to_string(), "10".to_string()).ret_code, 2);
}

#[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts/")]
fn div_zero_test() {
    assert_eq!(div("1".to_string(), "0".to_string()).ret_code, 3);
}

#[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts/")]
fn parse_fail_test() {
    assert_eq!(add("a".to_string(), "b".to_string()).ret_code, 4);
}
