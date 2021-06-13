#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# This script builds all subprojects and puts all created Wasm modules in one dir
(
  cd local_storage
  cargo update --aggressive
  marine build --release
)
(
  cd curl_adapter
  cargo update --aggressive
  marine build --release
)
(
  cd facade
  cargo update --aggressive
  marine build --release
)

mkdir -p sites
mkdir -p artifacts
rm -f artifacts/*.wasm
cp local_storage/target/wasm32-wasi/release/local_storage.wasm artifacts/
cp curl_adapter/target/wasm32-wasi/release/curl_adapter.wasm artifacts/
cp facade/target/wasm32-wasi/release/facade.wasm artifacts/
