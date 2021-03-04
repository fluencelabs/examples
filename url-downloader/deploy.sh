#!/bin/sh -euo pipefail

# build wasms
./build.sh

(
  cd artifacts
  fldist new_service --name "Url Downloader" --modules \
    curl_adapter.wasm:curl_adapter.json \
    local_storage.wasm:local_storage.json \
    facade.wasm:facade.json
)
