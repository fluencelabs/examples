#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

function is_installed {
      if command -v "$1" >/dev/null 2>&1; then
         echo "${1} is installed"
      else
         echo "${1} not found, please install it"
         echo "exiting..."
         exit 1
      fi
}

echo "building wasm modules..."
# build wasms
./build.sh

(
 is_installed jq
 is_installed aqua

 echo "generating keys..."

 SK=$(aqua key create | jq -r ."secretKey")
 
 echo "deploying the url-downloader service"

 aqua remote deploy_service \
       --addr /dns4/kras-05.fluence.dev/tcp/19001/wss/p2p/12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS \
       --config-path deployment_cfg.json \
       --sk ${SK} \
       --service url-downloader
)
