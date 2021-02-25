#!/bin/sh

# This script builds all subprojects and puts all created Wasm modules in one dir
mkdir -p artifacts

cd fce-cuckoo
cargo update
fce build --release
cd ..

rm -f artifacts/*
cp fce-cuckoo/target/wasm32-wasi/release/fce-cuckoo.wasm artifacts/