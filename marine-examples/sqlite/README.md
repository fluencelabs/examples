# SQLite Example

## Overview

[SQLite](https://www.sqlite.org/index.html) is an ubiquitous persistence solution also available on the Fluence stack. Unlike basic compute modules, using SQLite in a service is a little more intricate. In order to create the service, we need two dependencies: An SQLite Wasm module and an SQLite adapter, where the adapter is a [WASM IT compliant](https://crates.io/crates/marine-sqlite-connector) [sqlite](https://github.com/stainless-steel/sqlite) package implementation. The SQLite Wasm module can be obtain from the repo as a [release](https://github.com/fluencelabs/sqlite/releases/tag/v0.15.0_w) or compiled from [code](https://github.com/fluencelabs/sqlite).  For the purpose of this example, we use the release version -- see `build.sh`.

As a result, our service is comprised of two modules: the SQLite Wasm module and our sqlite module. 

## Build

To build the required artifacts, please run the following command:

```
./build.sh
```

Upon a successful build it results a couple of wasm modules:

```
➜  sqlite git:(main) ls artifacts
sqlite3.wasm     sqlite_test.wasm
```

## Run

To check how it works, we need to run `mrepl`:

```
➜  sqlite git:(main) mrepl Config.toml
Welcome to the Marine REPL (version 0.16.1)
Minimal supported versions
  sdk: 0.6.0
  interface-types: 0.20.0

New version is available! 0.16.1 -> 0.16.2
To update run: cargo +nightly install mrepl

app service was created with service id = e593c776-494a-4012-9020-5b50f44409d8
elapsed time 2.555104035s

1> i
Loaded modules interface:
data DBOpenDescriptor:
  ret_code: i32
  db_handle: u32
data DBPrepareDescriptor:
  ret_code: i32
  stmt_handle: u32
  tail: u32
data DBExecDescriptor:
  ret_code: i32
  err_msg: string

sqlite_test:
  fn test2(age: i64)
  fn test1(age: i64)
  fn test3()
  fn test_last_rowid() -> i64
sqlite3:
  fn sqlite3_errmsg(db_handle: u32) -> string
  fn sqlite3_open_v2(filename: string, flags: i32, vfs: string) -> DBOpenDescriptor
  fn sqlite3_bind_double(stmt_handle: u32, pos: i32, value: f64) -> i32
  fn sqlite3_column_count(stmt_handle: u32) -> i32
  fn sqlite3_bind_text(stmt_handle: u32, pos: i32, text: string, xDel: i32) -> i32
  fn sqlite3_errcode(db: u32) -> i32
  fn sqlite3_busy_timeout(db_handle: u32, ms: u32) -> i32
  fn sqlite3_changes(db_handle: u32) -> i32
  fn sqlite3_column_name(stmt_handle: u32, N: u32) -> string
  fn sqlite3_column_int64(stmt_handle: u32, icol: u32) -> i64
  fn sqlite3_bind_blob(stmt_handle: u32, pos: i32, blob: []u8, xDel: i32) -> i32
  fn sqlite3_finalize(stmt_handle: u32) -> i32
  fn sqlite3_column_type(stmt_handle: u32, icol: u32) -> i32
  fn sqlite3_prepare_v2(db_handle: u32, sql: string) -> DBPrepareDescriptor
  fn sqlite3_column_bytes(stmt_handle: u32, icol: u32) -> i32
  fn sqlite3_column_text(stmt_handle: u32, icol: u32) -> string
  fn sqlite3_column_blob(stmt_handle: u32, icol: i32) -> []u8
  fn sqlite3_column_double(stmt_handle: u32, icol: i32) -> f64
  fn sqlite3_close(db_handle: u32) -> i32
  fn sqlite3_exec(db_handle: u32, sql: string, callback_id: i32, callback_arg: i32) -> DBExecDescriptor
  fn sqlite3_total_changes(db_handle: u32) -> i32
  fn sqlite3_bind_null(stmt_handle: u32, pos: i32) -> i32
  fn sqlite3_libversion_number() -> i32
  fn sqlite3_reset(stmt_handle: u32) -> i32
  fn sqlite3_step(stmt_handle: u32) -> i32
  fn sqlite3_bind_int64(stmt_handle: u32, pos: i32, value: i64) -> i32

2> call sqlite_test test1 [20]
name = Alice
age = 42
name = Bob
age = 69
result: Null
 elapsed time: 37.443512ms

3> call sqlite_test test2 [20]
name = Alice
age = 42
name = Bob
age = 69
result: Null
 elapsed time: 1.715774ms

4> call sqlite_test test3 []
table size is: 2
result: Null
 elapsed time: 110.686235ms

5> call sqlite_test test_last_rowid []
result: Number(4)
 elapsed time: 39.816385ms

6> q
```

For more detailed and in depth reading on the example please refer to the [Marine Examples Readme](../README.md#sqlite-example)