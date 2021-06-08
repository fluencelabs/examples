#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# This script validates and builds all subprojects and puts all created Wasm modules in one dir

cargo update
cargo clippy --all -- -D warnings 
cargo fmt --all

marine build --release

rm -f -r artifacts/*
mkdir -p artifacts
cp target/wasm32-wasi/release/math256.wasm artifacts/

# tests are fast, so run them here
cargo +nightly test --release

