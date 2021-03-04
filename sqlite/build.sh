#!/bin/sh

# This script builds all subprojects and puts all created Wasm modules in one dir
cargo update
fce build --release

mkdir -p artifacts
rm artifacts/*.wasm
cp ../../target/wasm32-wasi/release/sqlite_test.wasm artifacts/
wget https://github.com/fluencelabs/sqlite/releases/download/v0.10.0_w/sqlite3.wasm -O artifacts/sqlite3.wasm
