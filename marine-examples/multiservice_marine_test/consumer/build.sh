#!/bin/sh

# This script builds all subprojects and puts all created Wasm modules in one dir
cargo update --aggressive
marine build --release

ARTIFACTS="artifacts"

if [ -d "$ARTIFACTS" ]; then
    rm ${ARTIFACTS}/* || true
else
    mkdir -p "$ARTIFACTS"
fi



cp target/wasm32-wasi/release/consumer.wasm artifacts/
