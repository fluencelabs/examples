import express from "express";
import bodyParser from"body-parser";
import { JSONRPCServer } from "json-rpc-2.0";
import {
    Call, Aqua, Path
} from "@fluencelabs/aqua-api/aqua-api.js";
import { FluencePeer } from "@fluencelabs/fluence";
import { callFunctionImpl } from "@fluencelabs/fluence/dist/internal/compilerSupport/v3impl/callFunction.js";
import {registerLogger} from "../aqua-compiled/rpc.js";

const route = "/"
const port = 3000
const aquaPath = new Path("aqua/rpc.aqua")
const relay = "/dns4/kras-02.fluence.dev/tcp/19001/wss/p2p/12D3KooWHLxVhUQyAuZe6AHMB29P7wkvTNMn7eDMcsqimJYLKREf"
const infuraUri = "https://goerli.infura.io/v3/c48f3b538f154204ad53d04aa8990544"

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

    // console.log(req)

    const args = {
        // add as params
        uri: infuraUri,
        method: op,
        // stringify all args to handle it in rust
        args: req.map((s) => JSON.stringify(s))
    }
    const aquaCall = new Call("call(uri, method, args)", args, aquaPath)

    const compilationResult = await Aqua.compile(aquaCall, [])
    console.log(compilationResult.functionCall.funcDef)

    const {funcDef, script} = compilationResult.functionCall

    // console.log(script)

    const result = await callFunctionImpl(funcDef, script, {}, fluence, args)
    // console.log("json rpc req")
    // console.log("result")
    // console.log(result)

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
        console.log(jsonRPCResponse)
        if (jsonRPCResponse) {
            res.json(jsonRPCResponse);
        } else {
            res.sendStatus(204);
        }
    });
});

app.listen(port);