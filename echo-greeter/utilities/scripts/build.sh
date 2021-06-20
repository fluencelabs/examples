#!/usr/bin/env bash -o errexit -o nounset -o pipefail

mkdir -p artifacts
rm -f artifacts/*.wasm
marine build --release
cp target/wasm32-wasi/release/utilities.wasm artifacts/
