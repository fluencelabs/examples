#!/bin/sh
set -o errexit -o nounset -o pipefail

# This script builds all subprojects and puts all created Wasm modules in one dir
cd pure
marine build --release

cd ../facade
marine build --release

cd ..

mkdir -p artifacts
rm -f artifacts/*.wasm
cp pure/target/wasm32-wasi/release/records_pure.wasm artifacts/
cp facade/target/wasm32-wasi/release/records_facade.wasm artifacts/
