#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

cd curl_adapter
marine build --release

cd ../ether_price_getter
marine build --release
cd ..

mkdir -p artifacts
rm -f artifacts/*.wasm
cp curl_adapter/target/wasm32-wasi/release/curl_adapter.wasm artifacts/
cp ether_price_getter/target/wasm32-wasi/release/ether_price_getter.wasm artifacts/
