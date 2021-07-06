#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# This script builds all subprojects and puts all created Wasm modules in one dir
cd effector
cargo update --aggressive
marine build --release

cd ../pure
cargo update --aggressive
marine build --release

cd ..
mkdir -p artifacts
rm -f artifacts/*.wasm
cp effector/target/wasm32-wasi/release/ipfs_effector.wasm artifacts/
cp pure/target/wasm32-wasi/release/ipfs_pure.wasm artifacts/
