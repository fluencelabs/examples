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

#[derive(Debug, Serialize, Deserialize)]
struct DataProcResponse {
    result: f64,
    outliers: Vec<f64>,
    error: String,
}

#[marine]
pub fn sum_data(data: Vec<String>) -> String {
    if data.len() < 1 {
        let result = DataProcResponse {
            result: -1.0,
            outliers: [].to_vec(),
            error: "No data provided".to_string(),
        };
        return serde_json::to_string(&result).unwrap();
    }

    let objs: Vec<serde_json::Value> = data
        .iter()
        .map(|o| serde_json::from_str(o).unwrap())
        .collect();

    let mut data: Vec<u128> = objs
        .iter()
        .map(|o| {
            u128::from_str_radix(
                o["result"].as_str().unwrap().strip_prefix("0x").unwrap(),
                16,
            )
            .unwrap()
        })
        .collect();

    let sum: f64 = data.iter().map(|x| *x as f64).sum();
    let result = DataProcResponse {
        result: sum,
        outliers: [].to_vec(),
        error: "".to_string(),
    };
    println!("{:?}", result);
    serde_json::to_string(&result).unwrap()
}

#[marine]
pub fn drop_outliers_and_average(data: Vec<String>) -> String {
    if data.len() < 1 {
        let result = DataProcResponse {
            result: -1.0,
            outliers: [].to_vec(),
            error: "No data provided".to_string(),
        };
        return serde_json::to_string(&result).unwrap();
    }

    let objs: Vec<serde_json::Value> = data
        .iter()
        .map(|o| serde_json::from_str(o).unwrap())
        .collect();

    let mut data: Vec<u128> = objs
        .iter()
        .map(|o| {
            u128::from_str_radix(
                o["result"].as_str().unwrap().strip_prefix("0x").unwrap(),
                16,
            )
            .unwrap()
        })
        .collect();
    data.sort();
    let mut low_high: Vec<f64> = Vec::new();
    if data.len() > 3 {
        // low_high.push([data.remove(0) as f64);
        // low_high.push(data.remove(data.last()) as f64);
        low_high.extend(&[data.remove(0) as f64, data.remove(data.len() - 1) as f64]);
    }
    let avg: f64 = (data.iter().sum::<u128>() as f64 / data.len() as f64);

    let result = DataProcResponse {
        result: avg,
        outliers: low_high,
        error: "".to_string(),
    };

    serde_json::to_string(&result).unwrap()
}

#[marine]
pub fn simple_average(data: Vec<String>) -> String {
    if data.len() < 1 {
        let result = DataProcResponse {
            result: -1.0,
            outliers: [].to_vec(),
            error: "No data provided".to_string(),
        };
        return serde_json::to_string(&result).unwrap();
    }

    let objs: Vec<serde_json::Value> = data
        .iter()
        .map(|o| serde_json::from_str(o).unwrap())
        .collect();

    let mut data: Vec<u128> = objs
        .iter()
        .map(|o| {
            u128::from_str_radix(
                o["result"].as_str().unwrap().strip_prefix("0x").unwrap(),
                16,
            )
            .unwrap()
        })
        .collect();
    let avg: f64 = (data.iter().sum::<u128>() as f64 / data.len() as f64);

    let result = DataProcResponse {
        result: avg,
        outliers: [].to_vec(),
        error: "".to_string(),
    };

    serde_json::to_string(&result).unwrap()
}

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
