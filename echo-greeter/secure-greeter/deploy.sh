#!/usr/bin/env bash

echo "secure greeter new service:"
fldist new_service --node 12D3KooWQYAEG4LJCUYZtnGAxjsDnkfnKSxfrML2RrTLY63dd33U --node-addr /ip4/127.0.0.1/tcp/9999/ws/p2p/12D3KooWQYAEG4LJCUYZtnGAxjsDnkfnKSxfrML2RrTLY63dd33U --name "secure-greeter" --modules artifacts/secure_greeter.wasm:configs/secure_greeter_cfg.json