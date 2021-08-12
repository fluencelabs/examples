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


import { provideFile } from "./provider";

import { set_timeout } from "@fluencelabs/aqua-ipfs-ts";
import { createClient, setLogLevel } from "@fluencelabs/fluence";
import { stage, krasnodar, Node, testNet } from "@fluencelabs/fluence-network-environment";
import { deploy_service, put_file_size, remove_service } from "@fluencelabs/ipfs-execution-aqua";
import { globSource, urlSource }from 'ipfs-http-client';

async function main(environment: Node[]) {
    // setLogLevel('DEBUG');
    let providerHost = environment[0];
    let providerClient = await createClient(providerHost);
    console.log("📘 uploading .wasm to node %s", providerHost.multiaddr);
    let path = globSource('../service/artifacts/process_files.wasm');
    let { file, swarmAddr, rpcAddr } = await provideFile(path, providerClient);
    console.log("📗 swarmAddr", swarmAddr);
    console.log("📗 rpcAddr", rpcAddr);

    const fluence = await createClient(environment[1]);
    console.log("📗 created a fluence client %s with relay %s", fluence.selfPeerId, fluence.relayPeerId);

    // default IPFS timeout is 1 sec, set to 10 secs to retrieve file from remote node
    await set_timeout(fluence, environment[2].peerId, 10);

    console.log("\n\n📘 Will deploy ProcessFiles service");
    var service_id = await deploy_service(
        fluence, 
        environment[2].peerId, file.cid.toString(), rpcAddr,
        (label, error) => { console.error("📕 deploy_service failed: ", label, error) },
        { ttl: 10000 }
    )
    service_id = fromOption(service_id);
    if (service_id === null) { 
        return; 
    }

    console.log("📗 ProcessFiles service is now deployed and available as", service_id);

    console.log("\n\n📘 Will upload file & calculate its size");
    let { file: newFile } = await provideFile(urlSource("https://i.imgur.com/NZgK6DB.png"), providerClient);
    var putResult = await put_file_size(
        fluence, 
        environment[2].peerId, newFile.cid.toString(), rpcAddr, service_id,
        fileSize => console.log("📗 Calculated file size:", fileSize),
        (label, error) => { console.error("📕 put_file_size failed: ", label, error) },
        { ttl: 10000 }
    )
    putResult = fromOption(putResult);
    if (putResult !== null) {
        console.log("📗 File size is saved to IPFS:", putResult);
    }

    let result = await remove_service(fluence, environment[2].peerId, service_id);
    console.log("📗 ProcessFiles service removed", result);
    return;
}

function fromOption<T>(opt: T | T[] | null): T | null {
    if (Array.isArray(opt)) {
        if (opt.length === 0) { return null; }
        
        opt = opt[0];
    }
    if (opt === null) { return null; }
    
    return opt;
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
} else if (args[0] == "testnet") {
    environment = testNet;
    console.log("📘 Will connect to testNet");
} else {
    throw "Specify environment";
}

main(environment)
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

