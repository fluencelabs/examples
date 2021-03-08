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

use fluence::fce; ///, WasmLoggerBuilder};
use fluence;
use fluence::WasmLoggerBuilder;
use fce_sqlite_connector;
use fce_sqlite_connector::{Connection, State, Value};


use std::path::{Path, PathBuf};
use serde::Deserialize;
use serde_json;

use std::sync::atomic::{AtomicBool, Ordering};

use crate::crud::create_table;
use crate::auth::is_owner;

const DB_PATH: &str  = "/tmp/fluence_service_db.sqlite";


mod crud;
mod auth;


fn main() { 
    // WasmLoggerBuilder::new().build().unwrap();
}

const KOVAN_ACCT: &str = "";

pub static AUTH: AtomicBool = AtomicBool::new(false);
pub static INIT: AtomicBool = AtomicBool::new(false);


fn get_connection() -> Connection {
    Connection::open(DB_PATH).unwrap()
}


#[fce]
#[derive(Debug)]
pub struct InitResult {
    pub success: bool,
    pub err_msg: String,
}

impl InitResult {
    fn success() -> Self {
        InitResult {success: true, err_msg: String::from(""),}
    }

    fn error(err_msg: String) -> Self {
        InitResult {success: false, err_msg,}
    }
}

#[fce]
pub fn init_service(is_auth:bool, is_paywall: bool, api_data: String) -> InitResult {

    if INIT.load(Ordering::Relaxed) {
        return InitResult::error("Service already initiated".into());
    }

    let conn = get_connection();
    let res = create_table(&conn);
    println!("create tables: {:?}", res);
    if res.is_err() {
        return InitResult::error("Failure to create tables".into());
    }

    AUTH.store(is_auth, Ordering::Relaxed);


    if api_data.len() > 0 {
        let tokens: Vec<&str> = api_data.as_str().split(":").collect();
        if tokens.len() != 2{
            return InitResult::error("Invalid api data".into());
        }

        let ins_stmt = "insert or ignore into api_keys values (?, ?)";
        let mut ins_cur = conn.prepare(ins_stmt).unwrap().cursor();
        let insert = ins_cur.bind(
        &[Value::String(tokens[0].into()),
                 Value::String(tokens[1].into()),
                ]
        );
        if insert.is_err() {
            return InitResult::error("Failure to insert api data".into());
        }
    } else {
        return InitResult::error("Missing api data".into());
    }
    
    //Todo: implement rollbacks

    INIT.store(true, Ordering::Relaxed);
    InitResult::success()
}


#[fce]
pub fn owner_nuclear_reset() -> bool {
    if !is_owner() {
        return false;
    }

    AUTH.store(false, Ordering::Relaxed);
    INIT.store(false, Ordering::Relaxed);

    let conn = get_connection();
    let t_names = vec!["api_keys", "reward_blocks", "payments", "costs", "security"];
    for t_name in t_names {
        let stmt = format!("delete from {}", t_name);
        let mut del_cur = conn.prepare(&stmt).unwrap().cursor();
        del_cur.next().unwrap();
    }

    true
}
