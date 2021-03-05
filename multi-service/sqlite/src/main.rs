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
use fluence::WasmLoggerBuilder;
use fce_sqlite_connector;
use fce_sqlite_connector::{Connection, State, Value};

use std::path::{Path, PathBuf};
use serde::Deserialize;
use serde_json;


// const DB_PATH: &str  = "/tmp/db_1.sqlite";
const DB_PATH: &str  = "/tmp/db1254.sqlite";

fn main() { 
    // WasmLoggerBuilder::new().build().unwrap();
}


fn get_connection() -> Connection {
    Connection::open(DB_PATH).unwrap()
}

fn create_table(conn: &Connection) -> std::result::Result<(), fce_sqlite_connector::Error> {

    let res = conn.execute(
        "
        create table if not exists reward_blocks (
            block_number integer  not null primary key, 
            timestamp integer not null, 
            block_miner text not null, 
            block_reward integer not null
        );

        create table if not exists payments (
            tx_number text  not null primary key, 
            chain_id integer not null,
            timestamp integer not null,
            amount integer not null,
            unit text not null,
            unique(tx_number, chain_id)
        );

        ",
    );
    res
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

#[fce]
pub fn update_reward_blocks(data_string: String) -> bool {  
   
    let conn = fce_sqlite_connector::open(DB_PATH).unwrap();
    create_table(&conn).unwrap();

    let data_string = "{\"status\":\"1\",\"message\":\"OK\",\"result\":{\"blockNumber\":\"11973516\",\"timeStamp\":\"1614884018\",\"blockMiner\":\"0x99c85bb64564d9ef9a99621301f22c9993cb89e3\",\"blockReward\":\"4640547346291918049\",\"uncles\":[],\"uncleInclusionReward\":\"0\"}}";
    let obj:serde_json::Value = serde_json::from_str(&data_string).unwrap();

    let insert = "insert or ignore into reward_blocks values(?, ?, ?, ?)";
    let mut ins_cur = conn.prepare(insert).unwrap().cursor();
    
    
    let insert = ins_cur.bind(
        &[Value::Integer(i64::from_str_radix(obj["result"]["blockNumber"].as_str().unwrap(), 10).unwrap()),
          Value::Integer(i64::from_str_radix(obj["result"]["timeStamp"].as_str().unwrap(), 10).unwrap()),
          Value::String(obj["result"]["blockMiner"].to_string()), 
          Value::Integer(i64::from_str_radix(obj["result"]["blockReward"].as_str().unwrap(), 10).unwrap()),
        ]
    );
    
    if insert.is_ok() {
        ins_cur.next().unwrap();
        let mut select = conn.prepare("select * from reward_blocks").unwrap().cursor();
        while let Some(row) = select.next().unwrap() {
            println!("select row {:?}", row);
            println!("{}, {}", row[0].as_integer().unwrap(), row[2].as_string().unwrap());
        }
        return true;
    }
    
    false
} 


#[fce]
pub fn get_latest_reward_block() -> Vec<String> {
    // let db_path = "/tmp/db.sqlite";
    let conn = fce_sqlite_connector::open(DB_PATH).unwrap();

    let mut result:Vec<String> = Vec::new();
    let select = conn.prepare("select * from reward_blocks order by block_number desc limit 1");
    match select {
        Ok(s) => {
            let mut select = s.cursor(); 
            while let Some(row) = select.next().unwrap() {
                println!("select row {:?}", row);
                println!("{}, {}", row[0].as_integer().unwrap(), row[2].as_string().unwrap());
                result.push(format!("{}, {}", row[0].as_integer().unwrap(), row[2].as_string().unwrap()));
            }
        }
        Err(e) => log::error!("no bueno"), // result.push(format!("{:?}",e))
    }
    result
}

#[fce]
#[derive(Debug)]
pub struct RewardBlock {
    pub block_number: i64,
    pub timestamp: i64,
    pub block_miner: String,
    pub block_reward: i64,
}

impl RewardBlock {
    fn from_row(row: &[Value]) -> Self {
        RewardBlock { 
            block_number: row[0].as_integer().unwrap(), 
            timestamp: row[1].as_integer().unwrap(), 
            block_miner: row[2].as_string().unwrap().into(), 
            block_reward: row[3].as_integer().unwrap(), 
        }
    }
}

#[fce]
pub fn get_reward_block(block_number: u32) -> Vec<RewardBlock> {
    let conn = fce_sqlite_connector::open(DB_PATH).unwrap();

    let mut result:Vec<RewardBlock> = Vec::new();
    let stmt = "select * from reward_blocks where block_number = ?";
    let select = conn.prepare(stmt);
    match select {
        Ok(s) => {
            let mut select = s.cursor();
            select.bind(&[Value::Integer(block_number as i64)]).unwrap(); 
            while let Some(row) = select.next().unwrap() {
                let rblock:RewardBlock = RewardBlock::from_row(row);
                result.push(rblock);
            }
        }
        Err(e) => log::error!("suck it"), //(format!("{:?}",e))
    }
    result
}

#[fce]
pub fn get_miner_rewards(miner_address: String) -> Vec<i64> {
    let conn = fce_sqlite_connector::open(DB_PATH).unwrap();

    let mut result:Vec<i64> = Vec::new();
    let stmt = "select block_reward from reward_blocks where block_miner = ?";
    let select = conn.prepare(stmt);
    match select {
        Ok(s) => {
            let mut select = s.cursor();
            select.bind(&[Value::String(miner_address)]).unwrap(); 
            while let Some(row) = select.next().unwrap() {
                println!("reward row {:?}", row);
                result.push(row[0].as_integer().unwrap());
            }
        }
        Err(e) => log::error!("suck it"), //(format!("{:?}",e))
    }
    result
}



fn get_tx(tx_string: String) {

}

fn update_payments(conn: &Connection) {


}