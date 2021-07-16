#!/usr/bin/env bash
set -euo pipefail

# check `fcli` and `fldist` tools are installed or install them
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
fldist new_service --modules "$WASM:$CONFIG" --name curl_template