#!/bin/sh -euo pipefail

# This script builds all subprojects and puts all created Wasm modules in one dir
(
  cd local_storage
  cargo update
  fce build --release
)
(
  cd curl_adapter
  cargo update
  fce build --release
)
(
  cd facade
  cargo update
  fce build --release
)

mkdir -p artifacts
rm -f artifacts/*.wasm
cp local_storage/target/wasm32-wasi/release/local_storage.wasm artifacts/
cp curl_adapter/target/wasm32-wasi/release/curl_adapter.wasm artifacts/
cp facade/target/wasm32-wasi/release/facade.wasm artifacts/
