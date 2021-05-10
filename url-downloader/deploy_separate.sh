#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

./build.sh

echo "Deploying storage"
(
  cd artifacts
  fldist new_service --name "local_storage" --modules local_storage.wasm:local_storage.json
)

echo "\n\nDeploying curl"
(
  cd artifacts
  fldist new_service --name "curl_adapter" --modules curl_adapter.wasm:curl_adapter.json
)
