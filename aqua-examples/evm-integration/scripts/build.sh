#!/usr/bin/env bash -o errexit -o nounset -o pipefail

mkdir -p artifacts
rm -f artifacts/*.wasm

cd curl-adapter
cargo update --aggressive
marine build --release
cp target/wasm32-wasi/release/curl_adapter.wasm ../artifacts/


cd ../multi-provider-query
cargo update --aggressive
marine build --release
cp target/wasm32-wasi/release/multi_provider_query.wasm ../artifacts/

cd ..