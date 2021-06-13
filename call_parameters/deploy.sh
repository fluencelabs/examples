#!/bin/bash
set -o errexit -o nounset -o pipefail

if [[ -z "${NODE:-}" ]]; then
    NODE_ADDR=""
else
    NODE_ADDR="--node-addr $NODE"
fi

./build.sh

# check it .wasm was built
WASM="artifacts/call_parameters.wasm"
test -f "$WASM" || echo >&2 "Couldn't find $WASM"

# create a service from that .wasm
CONFIG="config.json"
SERVICE_ID=$(fldist new_service $NODE_ADDR --modules "$WASM:$CONFIG" --name call_parameters | head -n1 | sed -e 's/service id: //')
echo $SERVICE_ID
