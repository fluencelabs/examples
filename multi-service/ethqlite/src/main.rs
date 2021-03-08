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

use uuid::Uuid;

use std::path::{Path, PathBuf};
use serde::Deserialize;
use serde_json;


// const DB_PATH: &str  = "/tmp/db_1.sqlite";
const DB_PATH: &str  = "/tmp/fluence_service_db.sqlite";


mod crud;
mod auth;
mod paywall;


fn main() { 
    // WasmLoggerBuilder::new().build().unwrap();
}

const KOVAN_ACCT: &str = "";

pub enum EthereumChains {
    MAINNET  =  1,
    ROPSTEN  =  3,
    RINKEBY  =  4,
    GOERLI   =  5,
    KOVAN    = 42,

}

fn get_connection() -> Connection {
    Connection::open(DB_PATH).unwrap()
}



#[fce]
pub fn init_service() -> bool {
    let conn = fce_sqlite_connector::open(DB_PATH).unwrap();
    let res = create_table(&conn);
    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}



pub fn is_owner() -> bool {
    let meta = fluence::get_call_parameters();
    let caller = meta.init_peer_id;
    let owner = meta.service_creator_peer_id;

    caller == owner
}


/*

#[fce]
fn get_balance(reference_id: String, ) {
    let conn = fce_sqlite_connector::open(DB_PATH).unwrap();

    let stmt = "select balance from payments where block_miner = ?";
    let select = conn.prepare(stmt);
    let mut miner_rewards = MinerRewards::new(miner_address.clone());

}

fn update_payments() {


}

#[fce]
pub struct AccountStatus {
    
}

fn check_funding(compute_units: u32) -> bool {
    let conn = fce_sqlite_connector::open(DB_PATH).unwrap();


    let stmt = "select block_reward from reward_blocks where block_miner = ?";
    let select = conn.prepare(stmt);
    let mut miner_rewards = MinerRewards::new(miner_address.clone());

    match select {
        Ok(s) => {
            let mut select = s.cursor();
            select.bind(&[Value::String(miner_address)]).unwrap();
            while let Some(row) = select.next().unwrap() {
                println!("reward row {:?}", row);
                miner_rewards.rewards.push(row[0].as_integer().unwrap().to_string());
            };
        }
        Err(e) => log::error!("suck it"), //(format!("{:?}",

}
*/