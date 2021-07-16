#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

cargo update --aggressive
marine build --release

mkdir -p artifacts
rm -f artifacts/*
cp target/wasm32-wasi/release/cuckoo_filter.wasm artifacts/
