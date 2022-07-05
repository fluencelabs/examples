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

import { provideFile } from './provider';

import { Fluence, FluencePeer } from '@fluencelabs/fluence';
import { Node } from '@fluencelabs/fluence-network-environment';
import { deploy_service, put_file_size, remove_service, set_timeout } from '@fluencelabs/ipfs-execution-aqua';

import { globSource, urlSource } from 'ipfs-http-client';

export async function main(environment: Node[]) {
    // setLogLevel('DEBUG');
    let providerHost = environment[4];
    let relay = environment[3];
    let serviceHost = environment[2];

    let providerClient = new FluencePeer();
    try {
        await providerClient.start({ connectTo: providerHost });
        console.log('📘 uploading .wasm to node %s', providerHost.multiaddr);
        const firstThing = await globSource('../service/artifacts/', 'process_files.wasm').next();
        const fileCandidate = await firstThing.value
        if(fileCandidate === undefined) {
            throw new Error("Couldn't read process_files.wasm");
        }
        let { file, swarmAddr, rpcAddr } = await provideFile(fileCandidate, providerClient);
        console.log('📗 swarmAddr', swarmAddr);
        console.log('📗 rpcAddr', rpcAddr);

        await Fluence.start({ connectTo: relay });
        console.log(
            '📗 created a fluence client %s with relay %s',
            Fluence.getStatus().peerId,
            Fluence.getStatus().relayPeerId,
        );

        // default IPFS timeout is 1 sec, set to 10 secs to retrieve file from remote node
        await set_timeout(serviceHost.peerId, 10);

        console.log('\n\n📘 Will deploy ProcessFiles service');
        var service_id = await deploy_service(
            serviceHost.peerId,
            file.cid.toString(),
            rpcAddr,
            (label, error) => {
                console.error('📕 deploy_service failed: ', label, error);
            },
            { ttl: 10000 },
        );
        service_id = fromOption(service_id);
        if (service_id === null) {
            await Fluence.stop();
            await providerClient.stop();
            return;
        }

        console.log('📗 ProcessFiles service is now deployed and available as', service_id);

        console.log('\n\n📘 Will upload file & calculate its size');
        let { file: newFile } = await provideFile(urlSource('https://i.imgur.com/NZgK6DB.png'), providerClient);
        var putResult = await put_file_size(
            serviceHost.peerId,
            newFile.cid.toString(),
            rpcAddr,
            service_id,
            (fileSize) => console.log('📗 Calculated file size:', fileSize),
            (label, error) => {
                console.error('📕 put_file_size failed: ', label, error);
            },
            { ttl: 10000 },
        );
        putResult = fromOption(putResult);
        if (putResult !== null) {
            console.log('📗 File size is saved to IPFS:', putResult);
        }

        let result = await remove_service(serviceHost.peerId, service_id);
        console.log('📗 ProcessFiles service removed', result);
    } finally {
        await Fluence.stop();
        await providerClient.stop();
    }
}

function fromOption<T>(opt: T | T[] | null): T | null {
    if (Array.isArray(opt)) {
        if (opt.length === 0) {
            return null;
        }

        opt = opt[0];
    }
    if (opt === null) {
        return null;
    }

    return opt;
}
