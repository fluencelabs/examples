import { create, CID } from 'ipfs-http-client';
import type { AddResult } from 'ipfs-core-types/src/root';
import type { ImportCandidate } from 'ipfs-core-types/src/utils';
import { Multiaddr, protocols } from 'multiaddr';

import { FluencePeer } from '@fluencelabs/fluence';
import { get_external_api_multiaddr, get_external_swarm_multiaddr } from '@fluencelabs/ipfs-execution-aqua';

export async function provideFile(
    source: ImportCandidate,
    provider: FluencePeer,
): Promise<{ file: AddResult; swarmAddr: string; rpcAddr: string }> {
    const relayPeerId = provider.getStatus().relayPeerId!;
    let swarmAddr;
    let result = await get_external_swarm_multiaddr(provider, provider.getStatus().relayPeerId!, { ttl: 20000 });
    if (result.success) {
        swarmAddr = result.multiaddr;
    } else {
        console.error('Failed to retrieve external swarm multiaddr from %s: ', provider.getStatus().relayPeerId!);
        throw result.error;
    }

    let rpcAddr;
    result = await get_external_api_multiaddr(provider, relayPeerId);
    if (result.success) {
        rpcAddr = result.multiaddr;
    } else {
        console.error('Failed to retrieve external api multiaddr from %s: ', relayPeerId);
        throw result.error;
    }

    let rpcMaddr = new Multiaddr(rpcAddr).decapsulateCode(protocols.names.p2p.code);
    // HACK: `as any` is needed because ipfs-http-client forgot to add `| Multiaddr` to the `create` types
    const ipfs = create(rpcMaddr as any);
    console.log('📗 created ipfs client to %s', rpcMaddr);

    await ipfs.id();
    console.log('📗 connected to ipfs');

    const file = await ipfs.add(source);
    console.log('📗 uploaded file:', file);

    // To download the file, uncomment the following code:
    //    let files = await ipfs.get(file.cid);
    //    for await (const file of files) {
    //        const content = uint8ArrayConcat(await all(file.content));
    //        console.log("📗 downloaded file of length ", content.length);
    //    }

    return { file, swarmAddr, rpcAddr };
}
