#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

if [[ -z "${NODE:-}" ]]; then
    NODE_ADDR=""
else
    NODE_ADDR="--node-addr $NODE"
fi

# check `marine` and `fldist` tools are installed or install them
(command -v marine || cargo install marine) >/dev/null
(command -v fldist || npm install -g @fluencelabs/fldist) >/dev/null

# build .wasm
(
    cd backend
    marine build --release
)

# check it .wasm was built
WASM="backend/target/wasm32-wasi/release/curl_template.wasm"
test -f "$WASM" || echo >&2 "Couldn't find $WASM"

# create a service from that .wasm
CONFIG="$(pwd)/backend/BackendConfig.json"
SERVICE_ID=$(fldist new_service $NODE_ADDR --modules "$WASM:$CONFIG" --name call_parameters | head -n1 | sed -e 's/service id: //')
echo $SERVICE_ID
