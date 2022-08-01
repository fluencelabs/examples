#!/usr/bin/env bash -o errexit -o nounset -o pipefail

function is_installed {
      if ! command -v "$1" >/dev/null 2>&1; then
         echo "${1} not found, please install it"
         echo "exiting..."
         exit 1
      fi
}

is_installed jq
is_installed aqua

echo "generating keys..."

SK=$(aqua key create | jq -r ".secretKey")

echo "deploying the service..."

aqua remote deploy_service \
     --addr /dns4/kras-04.fluence.dev/tcp/19001/wss/p2p/12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi \
     --config-path configs/ts_oracle_deploy_cfg.json \
     --sk ${SK} \
     --service ts-oracle \
>>\
deployed_service.data

tail -4 deployed_service.data