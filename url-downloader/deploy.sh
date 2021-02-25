#!/bin/sh -euo pipefail

# build wasms
sh build.sh

(
  cd artifacts
  fldist new_service --name "url_downloader" --modules \
    curl_adapter.wasm:curl_adapter.json \
    local_storage.wasm:local_storage.json \
    facade.wasm:facade.json
)
