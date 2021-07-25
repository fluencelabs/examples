#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

mkdir -p artifacts
rm -f artifacts/*.wasm

cargo update --aggressive
marine build --release


cp target/wasm32-wasi/release/greeting.wasm artifacts/
