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

use uuid::Uuid;
use ed25519_dalek::{Signature, Verifier, PublicKey};


use crate::get_connection;


pub enum EthereumChains {
    MAINNET  =  1,
    ROPSTEN  =  3,
    RINKEBY  =  4,
    GOERLI   =  5,
    KOVAN    = 42,

}


fn sig_check(pub_key: &[u8], message: &[u8], signature: [u8;64]) -> bool {
    let pk = PublicKey::from_bytes(pub_key).unwrap();
    let signature = Signature::new(signature);
    match pk.verify(message, &signature) {
        Ok(_) => true,
        Err(_) => false
    }
}


#[fce]
#[derive(Debug)]
pub struct DepositResult {
    success: bool,
    balance: String,
    err_msg: String,
}

impl DepositResult {
    fn success(balance: String) -> Self {
        DepositResult {
            success: true,
            balance,
            err_msg: String::from(""),
        }
    }

    fn failure(err_msg: String, balance: String) -> Self {
        DepositResult {
            success: false,
            balance,
            err_msg, 
        }
    }
}

pub fn deposit(user_id:String, tx_id: String, chain_id: u32, pub_key: &[u8], signature: &[u8]) -> DepositResult {
    let mut user_id:String = user_id;
    if user_id.len() == 0 {
        let user_id = Uuid::new_v4();
    }

    let stmt = "insert into table ??? where user_id = ? on conflict (user_id) do update set balance += ?";

    DepositResult::failure("no_good".into(), "0".into())
}

