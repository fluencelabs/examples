#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# build wasms
./build.sh

(
  cd artifacts
  fldist new_service --name "url_downloader" --modules \
    curl_adapter.wasm:curl_adapter.json \
    local_storage.wasm:local_storage.json \
    facade.wasm:facade.json
)
