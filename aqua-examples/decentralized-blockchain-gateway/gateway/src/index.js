#!/usr/bin/env node

"use strict";

import express from "express";
import bodyParser from "body-parser";
import { JSONRPCServer } from "json-rpc-2.0";
import { FluencePeer } from "@fluencelabs/fluence";
import {call, randomLoadBalancingEth, registerLogger} from "../aqua-compiled/rpc.js";
import {readArguments} from "./arguments.js";
import {readConfig} from "./config.js";

const args = readArguments(process.argv.slice(2))

if (args.errors.length > 0) {
    console.log(args.help)
    args.errors.forEach((err) => console.log(err))
    process.exit(1)
}

const config = readConfig(args.configPath)

console.log("Running server...")

const route = "/"

const methods = ['eth_accounts',
    'eth_blockNumber',
    'eth_call',
    'eth_chainId',
    'eth_estimateGas',
    'eth_getBalance',
    'eth_getBlockByHash',
    'eth_getBlockByNumber',
    'eth_getBlockTransactionCountByHash',
    'eth_getBlockTransactionCountByNumber',
    'eth_getCode',
    'eth_getLogs',
    'eth_getStorageAt',
    'eth_getTransactionByBlockHashAndIndex',
    'eth_getTransactionByBlockNumberAndIndex',
    'eth_getTransactionByHash',
    'eth_getTransactionCount',
    'eth_getTransactionReceipt',
    'eth_sendTransaction',
    'net_version',
    'web3_sha3',
    'eth_sendRawTransaction',
    'eth_subscribe',
    'eth_maxPriorityFeePerGas',
    'eth_getUncleCountByBlockHash',
    'eth_getUncleCountByBlockNumber',
    'net_listening',
    'net_peerCount',
    'eth_protocolVersion',
    'eth_syncing',
    'eth_coinbase',
    'eth_mining',
    'eth_hashrate',
    'eth_gasPrice',
    'eth_getStorageAt',
    'eth_sign',
    'eth_getCompilers',
    'eth_newBlockFilter',
    'eth_newPendingTransactionFilter',
    'eth_uninstallFilter',
    'eth_getFilterChanges',
    'eth_getWork',
    'eth_submitWork',
    'eth_submitHashrate',
    'db_putString',
    'db_getString',
    'db_putHex',
    'db_getHex',
    'shh_post',
    'shh_version',
    'shh_newIdentity',
    'shh_hasIdentity',
    'shh_newGroup',
    'shh_addToGroup',
    'shh_newFilter',
    'shh_uninstallFilter',
    'shh_getFilterChanges',
    'shh_getMessages']


const server = new JSONRPCServer();

// initialize fluence client
const fluence = new FluencePeer();
await fluence.start({connectTo: args.relay})

// handler for logger
registerLogger(fluence, {
    log: s => {
        console.log("log: " + s)
    },
    logCall: s => {
        console.log("Call will be to : " + s)
    },
})

async function methodHandler(req, method) {
    console.log(`Receiving request '${method}'`)
    const result = await randomLoadBalancingEth(fluence, config.providers, method, req.map((s) => JSON.stringify(s)), args.serviceId)

    return JSON.parse(result.value)

}

function addMethod(op) {
    server.addMethod(op, async (req) => methodHandler(req, op));
}

// register all eth methods
methods.forEach( (m) =>{
    addMethod(m);
})

const app = express();
app.use(bodyParser.json());

// register JSON-RPC handler
app.post(route, (req, res) => {
    const jsonRPCRequest = req.body;
    server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
        if (jsonRPCResponse) {
            res.json(jsonRPCResponse);
        } else {
            res.sendStatus(204);
        }
    });
});

app.listen(args.port);

console.log("Server was started on port " + args.port)