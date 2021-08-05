#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# This script builds all subprojects and puts all created Wasm modules in one dir
cargo update --aggressive
marine build --release

mkdir -p artifacts
rm -f artifacts/*.wasm
cp target/wasm32-wasi/release/hello_world.wasm artifacts/
