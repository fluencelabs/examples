/*
 * Copyright 2020 Fluence Labs Limited
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
use marine_rs_sdk::module_manifest;

use marine_sqlite_connector;
use marine_sqlite_connector::State;

module_manifest!();

pub fn main() {}

#[marine]
pub fn test1(age: i64) {
    let connection = marine_sqlite_connector::open(":memory:").unwrap();

    connection
        .execute(
            "
            CREATE TABLE users (name TEXT, age INTEGER);
            INSERT INTO users VALUES ('Alice', 42);
            INSERT INTO users VALUES ('Bob', 69);
        ",
        )
        .unwrap();

    let mut statement = connection
        .prepare("SELECT * FROM users WHERE age > ?")
        .unwrap();

    statement.bind(1, age).unwrap();

    while let State::Row = statement.next().unwrap() {
        println!("name = {}", statement.read::<String>(0).unwrap());
        println!("age = {}", statement.read::<i64>(1).unwrap());
    }
}

#[marine]
pub fn test2(age: i64) {
    use marine_sqlite_connector::Value;

    let connection = marine_sqlite_connector::open(":memory:").unwrap();

    connection
        .execute(
            "
            CREATE TABLE users (name TEXT, age INTEGER);
            INSERT INTO users VALUES ('Alice', 42);
            INSERT INTO users VALUES ('Bob', 69);
        ",
        )
        .unwrap();

    let mut cursor = connection
        .prepare("SELECT * FROM users WHERE age > ?")
        .unwrap()
        .cursor();

    cursor.bind(&[Value::Integer(age)]).unwrap();

    while let Some(row) = cursor.next().unwrap() {
        println!(
            "name = {}",
            row[0].as_string().expect("error on row[0] parsing")
        );
        println!(
            "age = {}",
            row[1].as_integer().expect("error on row[1] parsing")
        );
    }
}

#[marine]
pub fn test3() {
    let db_path = "/tmp/users.sqlite";
    let connection = marine_sqlite_connector::open(db_path).expect("db should be opened");

    connection
        .execute(
            "
            CREATE TABLE IF NOT EXISTS users (name TEXT, age INTEGER);
            INSERT INTO users VALUES ('Alice', 42);
            INSERT INTO users VALUES ('Bob', 69);
        ",
        )
        .expect("table should be created successfully");

    let connection = marine_sqlite_connector::open(db_path).expect("db should be opened");
    let cursor = connection.prepare("SELECT * FROM users").unwrap().cursor();

    println!("table size is: {:?}", cursor.count());
}

#[marine]
pub fn last_cursor() {
    let db_path = "/tmp/users.sqlite";
    let connection = marine_sqlite_connector::open(db_path).expect("db should be opened");

    // let mut select = conn
    //     .prepare("select * from reward_blocks")
    //     .unwrap()
    //     .cursor();

    let mut cursor = connection
        .prepare(
            "
            CREATE TABLE IF NOT EXISTS users (id integer not null primary key, name TEXT, age INTEGER);
            INSERT INTO users VALUES ('Alice', 42);
            INSERT INTO users VALUES ('Bob', 69);
            returning id;
        ",
        )
        .expect("table should be created successfully")
        .cursor();

    // println!("cursor is: {:?}", cursor);
    println!("cursor count is: {:?}", cursor.count());
    println!("next is: {:?}", cursor.next())
}

#[cfg(test)]
mod tests {
    use marine_rs_sdk_test::marine_test;
    use marine_rs_sdk_test::CallParameters;
    use marine_rs_sdk_test::SecurityTetraplet;

    #[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts")]
    fn test() {
        sqlite_test.last_cursor();
        // println!("last cursor is: {:?}", result);
    }
}
