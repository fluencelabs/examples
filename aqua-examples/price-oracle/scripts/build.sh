#!/usr/bin/env bash -o errexit -o nounset -o pipefail

mkdir -p artifacts

cd curl_adapter
cargo update --aggressive
marine build --release
cd ..

cd price_getter_service
cargo update --aggressive
marine build --release
cd ..

cd mean_service
cargo update --aggressive
marine build --release
cd ..

rm -f artifacts/*.wasm

cp curl_adapter/target/wasm32-wasi/release/curl_adapter.wasm artifacts/
cp price_getter_service/target/wasm32-wasi/release/price_getter_service.wasm artifacts/
cp mean_service/target/wasm32-wasi/release/mean_service.wasm artifacts/