use marine_rs_sdk::marine;
use marine_rs_sdk::module_manifest;
use std::io::{self, Write};

use marine_sqlite_connector;
use marine_sqlite_connector::{State, Value};

module_manifest!();

pub fn main() {}

#[marine]
pub fn sql_repl() {
    let connection = marine_sqlite_connector::open(":memory:").unwrap();
    let delimiter = ';';
    println!("For exit type QUIT;");
    loop {
        print!("SQL> ");
        io::stdout().flush().unwrap();

        let mut input_lines = io::stdin().lines();
        let mut sql_string: String = String::new();
        while let Some(line) = input_lines.next() {
            let l = line.unwrap();
            let l_no_spaces = l.trim();
            if let Some(pos) = l_no_spaces.find(delimiter) {
                sql_string.push_str(&l_no_spaces[..pos]);
                break;
            }
            sql_string.push_str(l_no_spaces);
            sql_string.push(' ');
        }

        println!("{}", sql_string);
        if let Some(first_word) = sql_string.split_whitespace().next() {
            match first_word.to_uppercase().as_str() {
                "SELECT" => {
                    let mut cursor = connection.prepare(sql_string).unwrap().cursor();
                    while let Some(row) = cursor.next().unwrap() {
                        for column in row.iter() {
                            match column {
                                Value::Binary(_) => print!(
                                    "bin {:}",
                                    String::from_utf8_lossy(column.as_binary().unwrap())
                                ),
                                Value::Float(_) => print!("{} ", column.as_float().unwrap()),
                                Value::Integer(_) => print!("{} ", column.as_integer().unwrap()),
                                Value::String(_) => print!("{} ", column.as_string().unwrap()),
                                Value::Null => print!("NULL "),
                            }
                        }
                    }
                    println!();
                }
                "QUIT" => break,
                _ => connection.execute(sql_string).unwrap(),
            };
        }

        println!();
    }
}

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
pub fn test_last_rowid() -> i64 {
    let db_path = "/tmp/users.sqlite";
    let connection = marine_sqlite_connector::open(db_path).expect("db should be opened");

    connection.execute(
        "CREATE TABLE IF NOT EXISTS users (id integer not null primary key AUTOINCREMENT, name TEXT, age INTEGER);"
    ).expect("table should be created successfully");

    connection
        .execute(
            "
            INSERT INTO users (name, age) VALUES ('Alice', 42);
            INSERT INTO users (name, age) VALUES ('Bob', 69);
        ",
        )
        .expect("insert");

    let stmt = connection
        .prepare("SELECT last_insert_rowid();")
        .expect("select");

    let mut cursor = stmt.cursor();
    match cursor.next() {
        Ok(Some(&[Value::Integer(id)])) => return id,
        other => panic!(
            "Expected integer to be returned from last_insert_rowid, got {:?}",
            other
        ),
    }
}

#[cfg(test)]
mod tests {
    use marine_rs_sdk_test::marine_test;

    // #[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts")]
    #[marine_test(config_path = "../../.fluence/Config.toml", modules_dir = "../artifacts")]
    fn test(sqlite_test: marine_test_env::sqlite_test::ModuleInterface) {
        assert!(sqlite_test.test_last_rowid() > 0);
    }
}