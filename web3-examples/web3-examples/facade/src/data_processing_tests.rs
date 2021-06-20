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
use serde::{Deserialize, Serialize};
use serde_json;

#[marine]
pub fn test_drop_outliers_and_average() {
    let data: Vec<String> = vec![
        r#"{"result": "0x64"}"#.to_string(),
        r#"{"result": "0x6E"}"#.to_string(),
        r#"{"result": "0x5A"}"#.to_string(),
        r#"{"result": "0xA"}"#.to_string(),
        r#"{"result": "0x3E8"}"#.to_string(),
    ];
    println!("{:?}", data);

    let result = drop_outliers_and_average(data);
    println!("{:?}", result);

    let data: Vec<String> = Vec::new();

    let result = drop_outliers_and_average(data);
    println!("{:?}", result);

    let data: Vec<String> = vec![
        r#"{"result": "0x64"}"#.to_string(),
        r#"{"result": "0x6E"}"#.to_string(),
    ];

    let result = drop_outliers_and_average(data);
    println!("{:?}", result);
}

#[marine]
pub fn test_simple_average() {
    let data: Vec<String> = vec![
        r#"{"result": "0x64"}"#.to_string(),
        r#"{"result": "0x6E"}"#.to_string(),
        r#"{"result": "0x5A"}"#.to_string(),
        r#"{"result": "0xA"}"#.to_string(),
        r#"{"result": "0x3E8"}"#.to_string(),
    ];
    println!("{:?}", data);

    let result = simple_average(data);
    println!("{:?}", result);

    let data: Vec<String> = Vec::new();

    let result = simple_average(data);
    println!("{:?}", result);

    let data: Vec<String> = vec![
        r#"{"result": "0x64"}"#.to_string(),
        r#"{"result": "0x6E"}"#.to_string(),
    ];

    let result = simple_average(data);
    println!("{:?}", result);
}
