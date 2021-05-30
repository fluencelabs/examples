#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# This script builds all subprojects and puts all created Wasm modules in one dir
cargo update
marine build --release

rm -f -r artifacts/*
mkdir artifacts
cp target/wasm32-wasi/release/math.wasm artifacts/
