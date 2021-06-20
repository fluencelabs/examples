#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

cargo update --aggressive
marine build --release

mkdir -p artifacts
rm -f artifacts/*.wasm
cp target/wasm32-wasi/release/secure_greeter.wasm artifacts/
