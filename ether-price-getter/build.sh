#!/bin/sh

mkdir -p artifacts

cd curl_adapter
fce build --release
cd ..

cd ether_price_getter
fce build --release
cd ..

rm -f artifacts/*
cp curl_adapter/target/wasm32-wasi/release/curl_adapter.wasm artifacts/
cp ether_price_getter/target/wasm32-wasi/release/ether_price_getter.wasm artifacts/
