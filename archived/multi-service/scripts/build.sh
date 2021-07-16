#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

cd curl_adapter
marine build --release

cd ../hex_converter
marine build --release

cd ../block_getter
marine build --release

cd ../extract_miner_address
marine build --release
cd ..

mkdir -p artifacts
rm -f artifacts/*.wasm

cp curl_adapter/target/wasm32-wasi/release/curl_adapter.wasm artifacts/
cp hex_converter/target/wasm32-wasi/release/hex_converter.wasm artifacts/
cp block_getter/target/wasm32-wasi/release/block_getter.wasm artifacts/
cp extract_miner_address/target/wasm32-wasi/release/extract_miner_address.wasm artifacts/
