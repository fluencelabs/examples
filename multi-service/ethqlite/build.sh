#!/usr/bin/env bash -o errexit -o nounset -o pipefail

# This script builds all subprojects and puts all created Wasm modules in one dir
# cargo update
fce build --release

# rm artifacts/*
cp target/wasm32-wasi/release/ethqlite.wasm artifacts/
# wget https://github.com/fluencelabs/sqlite/releases/download/v0.10.0_w/sqlite3.wasm
# mv sqlite3.wasm artifacts/
