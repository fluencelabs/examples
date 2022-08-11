#!/usr/bin/env bash

set -o errexit -o nounset -o pipefail

mkdir -p artifacts
rm -f artifacts/*.wasm

cd curl-adapter
cargo update --aggressive
marine build --release

cd ../near-rpc-services
cargo update --aggressive
marine build --release
cd ..

cp near-rpc-services/target/wasm32-wasi/release/near_rpc_services.wasm artifacts/
cp curl-adapter/target/wasm32-wasi/release/curl_adapter.wasm artifacts/
