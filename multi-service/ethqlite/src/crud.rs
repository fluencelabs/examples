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

use crate::*;
use fluence::fce;
use fce_sqlite_connector;
use fce_sqlite_connector::{Connection, State, Value};


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
            balance integer not null,
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

        create table if not exists security (
            peer_id Text not null, 
            service_id Text not null primary key, 
            fn_name Text not null, 
            json_path Text not null
        );
        ",
    );
    res
}

#[fce]
pub fn update_reward_blocks(data_string: String) -> bool {
    if !is_owner() {
        return false;
    }

    let obj:serde_json::Value = serde_json::from_str(&data_string).unwrap();
    let obj = obj["result"].clone();

    let conn = fce_sqlite_connector::open(DB_PATH).unwrap();

    let insert = "insert or ignore into reward_blocks values(?, ?, ?, ?)";
    let mut ins_cur = conn.prepare(insert).unwrap().cursor();
    

    let insert = ins_cur.bind(
 &[Value::Integer(i64::from_str_radix(obj["blockNumber"].as_str().unwrap(), 10).unwrap()),
          Value::Integer(i64::from_str_radix(obj["timeStamp"].as_str().unwrap(), 10).unwrap()),
          Value::String(obj["blockMiner"].to_string()), 
          Value::Integer(i64::from_str_radix(obj["blockReward"].clone().as_str().unwrap(), 10).unwrap()),
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

    miner_rewards
}
