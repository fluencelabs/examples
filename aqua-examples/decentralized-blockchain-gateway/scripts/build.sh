#!/usr/bin/env bash -o errexit -o nounset -o pipefail

mkdir -p artifacts
rm -f artifacts/*.wasm

cd wasm-modules

cd curl-adapter
cargo update --aggressive
marine build --release
cp target/wasm32-wasi/release/curl_adapter.wasm ../../artifacts/

cd ../ipfs-adapter
cargo update --aggressive
marine build --release
cp target/wasm32-wasi/release/ipfs_adapter.wasm ../../artifacts/

cd ../multi-provider-query
cargo update --aggressive
marine build --release
cp target/wasm32-wasi/release/multi_provider_query.wasm ../../artifacts/

cd ../simple-quorum
cargo update --aggressive
marine build --release
cp target/wasm32-wasi/release/simple_quorum.wasm ../../artifacts/

cd ../ipfs-cli
cargo update --aggressive
marine build --release
cp target/wasm32-wasi/release/ipfs_cli.wasm ../../artifacts/

cd ../utilities
cargo update --aggressive
marine build --release
cp target/wasm32-wasi/release/utilities.wasm ../../artifacts/

cd ..