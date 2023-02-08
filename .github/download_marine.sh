#!/bin/bash
set -o pipefail -o errexit -o nounset
set -x

MARINE_RELEASE="https://github.com/fluencelabs/marine/releases/download/marine-v0.12.6/marine"
curl -sS -L $MARINE_RELEASE -o /usr/local/bin/marine && chmod +x /usr/local/bin/marine
