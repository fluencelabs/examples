#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# This script builds all subprojects and puts all created Wasm modules in one dir
# cargo update
fce build --release

rm -f artifacts/*.wasm
cp target/wasm32-wasi/release/ethqlite.wasm artifacts/
wget https://github.com/fluencelabs/sqlite/releases/download/v0.14.0_w/sqlite3.wasm
mv sqlite3.wasm artifacts/
