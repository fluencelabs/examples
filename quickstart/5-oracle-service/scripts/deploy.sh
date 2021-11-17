#!/usr/bin/env bash -o errexit -o nounset -o pipefail

fldist --node-id 12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi \
        new_service \
        --ms artifacts/ts_oracle.wasm:configs/ts_oracle_cfg.json \
        --name ts-oracle \
        --verbose \
>> \
deployed_service.data 