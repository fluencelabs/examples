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

use uuid::Uuid;

use std::path::{Path, PathBuf};
use serde::Deserialize;
use serde_json;


// const DB_PATH: &str  = "/tmp/db_1.sqlite";
const DB_PATH: &str  = "/tmp/db1254.sqlite";

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
            available integer not null,
            unique(chain_id, tx_number)
        );

        create table if not exists costs (
            chain_id integer not null primary key,
            query_cost integer not null,
            cost_unit string not null ,
            currency string not null
        );

        insert or ignore into costs values(42, 10, 'gwei', 'eth');
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

    println!("{}", data_string);
    let obj:serde_json::Value = serde_json::from_str(&data_string).unwrap();
    let obj = obj["result"].clone();
    println!("result obj: {:?}", obj);
    println!("blockNumber: {:?}", obj["blockNumber"]);

    let conn = fce_sqlite_connector::open(DB_PATH).unwrap();
    println!("crate table: {:?}", create_table(&conn).unwrap());

    
    // let data_string = "{\"status\":\"1\",\"message\":\"OK\",\"result\":{\"blockNumber\":\"11980217\",\"timeStamp\":\"1614972187\",\"blockMiner\":\"0x2a0eee948fbe9bd4b661adedba57425f753ea0f6\",\"blockReward\":\"4106318342441412983\",\"uncles\":[],\"uncleInclusionReward\":\"0\"}}";
    // let obj:serde_json::Value = serde_json::from_str(&data_string).unwrap();

    let insert = "insert or ignore into reward_blocks values(?, ?, ?, ?)";
    let mut ins_cur = conn.prepare(insert).unwrap().cursor();
    

    let insert = ins_cur.bind(
 &[Value::Integer(i64::from_str_radix(obj["blockNumber"].as_str().unwrap(), 10).unwrap()),
          Value::Integer(i64::from_str_radix(obj["timeStamp"].as_str().unwrap(), 10).unwrap()),
          Value::String(obj["blockMiner"].to_string()), 
          Value::Integer(i64::from_str_radix(obj["blockReward"].clone().as_str().unwrap(), 10).unwrap()),
        ]
    );

    println!("insert: {:?}", insert);

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
#[derive(Debug)]
pub struct RewardBlock {
    pub block_number: i64,
    pub timestamp: i64,
    pub block_miner: String,
    pub block_reward: String,
}

impl RewardBlock {
    fn from_row(row: &[Value]) -> Self {
        RewardBlock { 
            block_number: row[0].as_integer().unwrap(), 
            timestamp: row[1].as_integer().unwrap(), 
            block_miner: row[2].as_string().unwrap().into(), 
            block_reward: row[3].as_integer().unwrap().to_string(), 
        }
    }

    fn from_err() -> Self {
        RewardBlock { 
            block_number: -1,
            timestamp: -1,
            block_miner: String::from(""), 
            block_reward: String::from(""),
        }
    }

}

#[fce]
pub fn get_latest_reward_block() -> RewardBlock {
    // let db_path = "/tmp/db.sqlite";
    let conn = fce_sqlite_connector::open(DB_PATH).unwrap();
    let mut reward_block = RewardBlock::from_err();

    let select = conn.prepare("select * from reward_blocks order by block_number desc limit 1");
    let result = match select {
        Ok(s) => {
            let mut select = s.cursor(); 
            while let Some(row) = select.next().unwrap() {
                println!("get_latest_reward_block: {:?}", row);
                reward_block = RewardBlock::from_row(row);
            };
            return reward_block;
        }
        Err(e) => reward_block,
    };
    result
}



#[fce]
pub fn get_reward_block(block_number: u32) -> RewardBlock {
    let conn = fce_sqlite_connector::open(DB_PATH).unwrap();

    let mut reward_block = RewardBlock::from_err();
    let stmt = "select * from reward_blocks where block_number = ?";
    let select = conn.prepare(stmt);
    match select {
        Ok(s) => {
            let mut select = s.cursor();
            select.bind(&[Value::Integer(block_number as i64)]).unwrap(); 
            while let Some(row) = select.next().unwrap() {
                println!("get_reward_block: {:?}", row);
                reward_block = RewardBlock::from_row(row);
            };
            return reward_block;
        }
        Err(e) => reward_block
    }
}

#[fce]
#[derive(Debug)]
pub struct MinerRewards {
    pub miner_address: String,
    pub rewards: Vec<String>
}
impl MinerRewards {
    fn new(miner_address: String) -> Self {
        let rewards:Vec<String> = Vec::new();

        MinerRewards {
            miner_address,
            rewards
        } 
    }
}

#[fce]
pub fn get_miner_rewards(miner_address: String) -> MinerRewards {
    let conn = fce_sqlite_connector::open(DB_PATH).unwrap();

    println!("miner address: {}", miner_address);

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
        Err(e) => log::error!("suck it"), //(format!("{:?}",e))
    };

    println!("miner reward: {:?}", miner_rewards);
    miner_rewards
}

/*

#[fce]
pub fn get_account(chain_id:u32) -> String {
    KOVAN_ACCT.into()

}

fn deposit(tx_string: String, chain_id:u32) {

    if chain_id != 42 {
        return "only kovan network, 42, is currently available";
    }

    // check deposit, get amount
    // if valid tx

    let stmt = "select * from credits where tx_id = ? and chain_id = ? ";

    // if exists: ...alloc

    // else:

    // credit = amount fro wei to gwei
    // select cost from costs where chain_id = ?

    let stmt = "insert into credits values (?, ?, ?)";

    let my_uuid = Uuid::new_v4();
}

fn get_balance(reference_id: String, ) {

}

fn update_payments() {


}
*/