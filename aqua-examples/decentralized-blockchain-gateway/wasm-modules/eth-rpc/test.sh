#!/usr/bin/env bash

set -o nounset
set -o errexit
set -o pipefail

cd "$(dirname "$0")"

mkdir -p tests_artifacts

# build eth-rpc.wasm
marine build --release
cp ./target/wasm32-wasi/release/eth-rpc.wasm tests_artifacts/

# build curl-adapter.wasm
(cd ../curl-adapter; marine build --release)
cp ../curl-adapter/target/wasm32-wasi/release/curl_adapter.wasm tests_artifacts/

#if [[ ! -f "tests_artifacts/sqlite3.wasm" ]]; then
#  # download SQLite 3
#  curl -L https://github.com/fluencelabs/sqlite/releases/download/v0.15.0_w/sqlite3.wasm -o tests_artifacts/sqlite3.wasm
#fi

# run tests
cargo nextest run --release --no-fail-fast --nocapture
