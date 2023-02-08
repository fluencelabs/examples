#!/usr/bin/env node

"use strict";

handleEPIPE(process.stderr)
handleEPIPE(process.stdout)
function handleEPIPE(stream) {
    stream.on('error', onerror)
    function onerror(err) {
        if (err.code === 'EPIPE') {
            stream._write = noopWrite
            stream._writev = noopWritev
            stream._read = noopRead
            return stream.removeListener('error', onerror)
        }
        if (EE.listenerCount(stream, 'error') === 1) {
            stream.removeListener('error', onerror)
            stream.emit('error', err)
        }
    }
}
function noopWrite(chunk, enc, cb) {
    cb()
}
function noopRead() {
    this.push('')
}
function noopWritev(chunks, cb) {
    cb()
}

import express from "express";
import bodyParser from "body-parser";
import { JSONRPCServer } from "json-rpc-2.0";
import { FluencePeer } from "@fluencelabs/fluence";
import {call, registerLogger} from "../aqua-compiled/rpc.js";

var args = process.argv.slice(2);

const port = args[0]
const relay = args[1]
const ethRpcURI = args[2]
const serviceId = args[3]

let errors = []
if (!port) {
    errors.push("Specify port")
}
if (!relay) {
    errors.push("Specify Fluence peer address")
}
if (!ethRpcURI) {
    errors.push("Specify uri to ethereum RPC")
}
if (!serviceId) {
    errors.push("Specify id to ethereum Aqua service")
}

if (errors.length > 0) {
    console.log("Example: aqua-eth-gateway <port> <fluence-addr> <eth-rpc-uri> <service-id>")
    errors.forEach((err) => console.log(err))
    process.exit(1)
}

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
    'eth_getUncleCountByBlockNumber']


const server = new JSONRPCServer();

// initialize fluence client
const fluence = new FluencePeer();
await fluence.start({connectTo: relay})

// handler for logger
registerLogger(fluence, {
    log: s => {
        console.log("log: " + s)
    }
})

async function methodHandler(req, op) {
    const result = await call(fluence, ethRpcURI, op, req.map((s) => JSON.stringify(s)), serviceId)

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

app.listen(port);