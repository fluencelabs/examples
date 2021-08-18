#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

# set current working directory to script parent directory to run script from everywhere
cd "$(dirname "$0")"/..

mkdir -p artifacts
rm -f artifacts/*.wasm
marine build --release
cp target/wasm32-wasi/release/process_files.wasm artifacts/
marine aqua artifacts/process_files.wasm >../aqua/aqua/process_files.aqua
