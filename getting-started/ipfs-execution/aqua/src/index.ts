/*
 * Copyright 2020 Fluence Labs Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { set_timeout, get_external_swarm_multiaddr, get_external_api_multiaddr } from "@fluencelabs/aqua-ipfs";
import {createClient, setLogLevel} from "@fluencelabs/fluence";
import {stage, krasnodar, Node, testNet} from "@fluencelabs/fluence-network-environment";
import { Multiaddr, protocols } from 'multiaddr';
import { deploy_service, get_file_size, remove_service } from "./process";

const { create, globSource, urlSource, CID } = require('ipfs-http-client');
const all = require('it-all');
const uint8ArrayConcat = require('uint8arrays/concat')

async function provideFile(source: any, host: Node): Promise<{ file: typeof CID, swarmAddr: string, rpcAddr: string }> {
    const provider = await createClient(host);

    var swarmAddr;
    var result = await get_external_swarm_multiaddr(provider, provider.relayPeerId!);
    if (result.success) {
        swarmAddr = result.multiaddr;
    } else {
        console.error("Failed to retrieve external swarm multiaddr from %s: ", provider.relayPeerId);
        throw result.error;
    }

    var rpcAddr;
    var result = await get_external_api_multiaddr(provider, provider.relayPeerId!);
    if (result.success) {
        rpcAddr = result.multiaddr;
    } else {
        console.error("Failed to retrieve external api multiaddr from %s: ", provider.relayPeerId);
        throw result.error;
    }

    var rpcMaddr = new Multiaddr(rpcAddr).decapsulateCode(protocols.names.p2p.code);
    const ipfs = create(rpcMaddr);
    console.log("📗 created ipfs client to %s", rpcMaddr);

    await ipfs.id();
    console.log("📗 connected to ipfs");

    const file = await ipfs.add(source);
    console.log("📗 uploaded file:", file);

    // To download the file, uncomment the following code:
    //    let files = await ipfs.get(file.cid);
    //    for await (const file of files) {
    //        const content = uint8ArrayConcat(await all(file.content));
    //        console.log("📗 downloaded file of length ", content.length);
    //    }

    return { file, swarmAddr, rpcAddr };
}


async function main(environment: Node[]) {
    // setLogLevel('DEBUG');
    let providerHost = environment[0];
    console.log("📘 uploading .wasm to node %s", providerHost.multiaddr);
    let path = globSource('../service/artifacts/process_files.wasm');
    let { file, swarmAddr, rpcAddr } = await provideFile(path, providerHost);
    console.log("📗 swarmAddr", swarmAddr);
    console.log("📗 rpcAddr", rpcAddr);

    const fluence = await createClient(environment[1]);
    console.log("📗 created a fluence client %s with relay %s", fluence.selfPeerId, fluence.relayPeerId);

    // default IPFS timeout is 1 sec, set to 10 secs to retrieve file from remote node
    await set_timeout(fluence, environment[2].peerId, 10);

    console.log("\n\n📘 Will deploy ProcessFiles service");
    let service_id = await deploy_service(
        fluence, 
        environment[2].peerId, file.cid.toString(), rpcAddr, 
        (msg, value) => console.log(msg, value),
        { ttl: 10000 }
    )
    console.log("📗 ProcessFiles service is now deployed and available as", service_id);

    console.log("\n\n📘 Will upload file & calculate its size");
    let { file: newFile } = await provideFile(urlSource("https://i.imgur.com/NZgK6DB.png"), providerHost)
    let fileSize = await get_file_size(
        fluence, 
        environment[2].peerId, newFile.cid.toString(), rpcAddr, service_id,
        { ttl: 10000 }
    )
    console.log("📗 Calculated file size:", fileSize)

    let result = await remove_service(fluence, environment[2].peerId, service_id);
    console.log("📕 ProcessFiles service removed", result);
    return;
}

let args = process.argv.slice(2);
var environment: Node[];
if (args.length >= 1 && args[0] == "testnet") {
    environment = testNet;
    console.log("📘 Will connect to testNet");
} else if (args[0] == "stage") {
    environment = stage;
    console.log("📘 Will connect to stage");
} else if (args[0] == "krasnodar") {
    environment = krasnodar;
    console.log("📘 Will connect to krasnodar");
} else {
    throw "Specify environment";
}

main(environment)
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

