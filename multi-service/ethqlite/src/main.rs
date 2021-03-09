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

pub static INIT: AtomicBool = AtomicBool::new(false);

fn main() {}


fn get_connection() -> Connection {
    Connection::open(DB_PATH).unwrap()
}


#[fce]
#[derive(Debug)]
pub struct InitResult {
    pub success: bool,
    pub err_msg: String,
}

#[fce]
pub fn init_service() -> InitResult {

    if !is_owner() {
        return InitResult {success: false, err_msg: "Not authorized to use this service".into()};
    }

    if INIT.load(Ordering::Relaxed) {
        return InitResult {success: false, err_msg: "Service already initiated".into()};
    }

    let conn = get_connection();
    let res = create_table(&conn);
    if res.is_err() {
        return InitResult {success: false, err_msg: "Failure to create tables".into()};
    }
    
    // TODO: implement rollbacks

    INIT.store(true, Ordering::Relaxed);
    InitResult {success: true, err_msg: "".into()}
}


#[fce]
pub fn owner_nuclear_reset() -> bool {
    if !is_owner() {
        return false;
    }

    INIT.store(false, Ordering::Relaxed);

    let conn = get_connection();
    let t_names = vec!["reward_blocks"];
    for t_name in t_names {
        let stmt = format!("delete from {}", t_name);
        let mut del_cur = conn.prepare(&stmt).unwrap().cursor();
        del_cur.next().unwrap();
    }

    true
}
