#!/bin/bash
set -o errexit -o nounset -o pipefail

if [ $# -eq 1 ]; then
    NODE="$1"
else
    echo "Expected single argument: node multiaddress. Got $# arguments."
    exit 1
fi

./build.sh

# check it .wasm was built
WASM="artifacts/call_parameters.wasm"
test -f "$WASM" || echo >&2 "Couldn't find $WASM"

# create a service from that .wasm
CONFIG="config.json"
SERVICE_ID=$(aqua remote deploy --sk qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo= --config-path config.json --service call_parameters --addr "$NODE" | tail -n 1 | tr -d \")
echo $SERVICE_ID
