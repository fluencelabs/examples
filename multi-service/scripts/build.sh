#!/bin/sh

mkdir -p artifacts

cd curl_adapter
fce build --release
cd ..

cd hex_converter
fce build --release
cd ..

cd block_getter
fce build --release
cd ..

cd extract_miner_address
fce build --release
cd ..

rm -f artifacts/*
cp curl_adapter/target/wasm32-wasi/release/curl_adapter.wasm artifacts/
cp hex_converter/target/wasm32-wasi/release/hex_converter.wasm artifacts/
cp block_getter/target/wasm32-wasi/release/block_getter.wasm artifacts/
cp extract_miner_address/target/wasm32-wasi/release/extract_miner_address.wasm artifacts/
