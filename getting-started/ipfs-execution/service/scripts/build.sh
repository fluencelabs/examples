#!/usr/bin/env bash -o errexit -o nounset -o pipefail
cargo update --aggressive

mkdir -p artifacts
rm -f artifacts/*.wasm
marine build --release
cp target/wasm32-wasi/release/process_files.wasm artifacts/
