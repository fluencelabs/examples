#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# This script builds all subprojects and puts all created Wasm modules in one dir
mkdir -p artifacts
cargo update
fce build --release

rm -f artifacts/*.wasm
cp target/wasm32-wasi/release/secure_greeter.wasm artifacts/
