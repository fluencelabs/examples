#!/bin/sh

# This script builds all subprojects and puts all created Wasm modules in one dir
# cd sqlite
# cargo update
# fce build --release
# cd ..

mkdir -p artifacts

cd curl_adapter
cargo update
fce build --release
cd ..

cd facade
cargo update
fce build --release
cd ..

rm -f artifacts/*
cp curl_adapter/target/wasm32-wasi/release/curl_adapter.wasm artifacts/
cp facade/target/wasm32-wasi/release/facade.wasm artifacts/
# cp sqlite/target/wasm32-wasi/release/sqlite_test.wasm artifacts/
# wget https://github.com/fluencelabs/sqlite/releases/download/v0.9.0_w/sqlite3.wasm
# mv sqlite3.wasm artifacts/