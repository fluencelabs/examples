#!/usr/bin/env bash

mkdir -p artifacts
rm -f artifacts/*.wasm

cd echo-service
marine build --release
cp target/wasm32-wasi/release/echo_service.wasm ../artifacts/

cd ../greeting
marine build --release
cp target/wasm32-wasi/release/greeting.wasm ../artifacts/

cd ..
