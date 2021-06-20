#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

cd curl_adapter
cargo update --aggressive
marine build --release

cd ../facade
cargo update --aggressive
marine build --release
cd ..

mkdir -p artifacts
rm -f artifacts/*.wasm

cp curl_adapter/target/wasm32-wasi/release/curl_adapter.wasm artifacts/
cp facade/target/wasm32-wasi/release/facade.wasm artifacts/
