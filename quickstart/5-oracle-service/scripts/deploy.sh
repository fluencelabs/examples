#!/usr/bin/env bash -o errexit -o nounset -o pipefail

aqua remote deploy_service \
     --addr /dns4/kras-04.fluence.dev/tcp/19001/wss/p2p/12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi \
     --data-path configs/ts_oracle_deploy_cfg.json \
     --service ts-oracle \
>>\
deployed_service.data