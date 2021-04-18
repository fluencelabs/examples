#!/usr/bin/env bash

echo "'echo-service' new service:"
# fldist new_service --node 12D3KooWMM28JWc4szJLrpfBoD3a4oWUyMbrywgyneS2kg1KREMY --node-addr /ip4/127.0.0.1/tcp/9999/ws/p2p/12D3KooWMM28JWc4szJLrpfBoD3a4oWUyMbrywgyneS2kg1KREMY --name "echo-service" --modules artifacts/echo_service.wasm:configs/echo_service_cfg.json


echo "'greeting' new service:"
fldist new_service --node 12D3KooWMM28JWc4szJLrpfBoD3a4oWUyMbrywgyneS2kg1KREMY --node-addr /ip4/127.0.0.1/tcp/9999/ws/p2p/12D3KooWMM28JWc4szJLrpfBoD3a4oWUyMbrywgyneS2kg1KREMY --name "greeting" --modules artifacts/greeting.wasm:configs/greeting_cfg.json