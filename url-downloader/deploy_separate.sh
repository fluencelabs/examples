#!/bin/sh -euo pipefail

./build.sh

echo "Deploying storage"
(
  cd artifacts
  fldist new_service --name "URL Local Storage" --modules local_storage.wasm:local_storage.json
)

echo "\n\nDeploying curl"
(
  cd artifacts
  fldist new_service --name "Curl Adapter" --modules curl_adapter.wasm:curl_adapter.json
)
