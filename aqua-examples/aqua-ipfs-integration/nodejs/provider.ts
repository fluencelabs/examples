import { create, CID }from 'ipfs-http-client';
import { AddResult } from 'ipfs-core-types/src/root';
import { Multiaddr, protocols } from 'multiaddr';
import { get_external_swarm_multiaddr, get_external_api_multiaddr } from "@fluencelabs/aqua-ipfs-ts";
import { FluenceClient } from "@fluencelabs/fluence";

export async function provideFile(source: any, provider: FluenceClient): Promise<{ file: AddResult, swarmAddr: string, rpcAddr: string }> {
    var swarmAddr;
    var result = await get_external_swarm_multiaddr(provider, provider.relayPeerId!, { ttl: 20000 });
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
    // HACK: `as any` is needed because ipfs-http-client forgot to add `| Multiaddr` to the `create` types
    const ipfs = create(rpcMaddr as any);
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
