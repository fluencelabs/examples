#!/usr/bin/env bash -o errexit -o nounset -o pipefail


mkdir -p artifacts
rm -f artifacts/*.wasm

cd services/curl-adapter
cargo update --aggressive
marine build --release
cp target/wasm32-wasi/release/curl_adapter.wasm ../../artifacts/

cd ../ceramic-adapter-custom
cargo update --aggressive
marine build --release
cp target/wasm32-wasi/release/ceramic_adapter_custom.wasm ../../artifacts/

