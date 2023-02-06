#!/usr/bin/env bash

set -o errexit -o nounset -o pipefail

mkdir -p artifacts
rm -f artifacts/*.wasm

cd wasm-modules

cd curl-adapter
marine build --release
cp target/wasm32-wasi/release/curl_adapter.wasm ../../artifacts/

cd ../ipfs-adapter
marine build --release
cp target/wasm32-wasi/release/ipfs_adapter.wasm ../../artifacts/

cd ../multi-provider-query
marine build --release
cp target/wasm32-wasi/release/multi_provider_query.wasm ../../artifacts/

cd ../simple-quorum
marine build --release
cp target/wasm32-wasi/release/simple_quorum.wasm ../../artifacts/

cd ../ipfs-cli
marine build --release
cp target/wasm32-wasi/release/ipfs_cli.wasm ../../artifacts/

cd ../utilities
marine build --release
cp target/wasm32-wasi/release/utilities.wasm ../../artifacts/

cd ../eth-rpc
marine build --release
cp target/wasm32-wasi/release/eth-rpc.wasm ../../artifacts/

cd ..