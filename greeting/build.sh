#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# This script builds all subprojects and puts all created Wasm modules in one dir
cargo update
fce build --release

rm artifacts/*
cp target/wasm32-wasi/release/greeting.wasm artifacts/
