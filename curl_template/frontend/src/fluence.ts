import { FluenceClient, Particle, sendParticleAsFetch } from '@fluencelabs/fluence';
import { testNet } from '@fluencelabs/fluence-network-environment';
import { v4 as uuidv4 } from 'uuid';

export const relayNode = testNet[3];
const node = relayNode.peerId;

const serviceId = '4d082281-c72c-468b-b30a-e9ebad70546c';

export const curlRequest = async (client: FluenceClient, url: String, ttl: number) => {
    const script = `
    (seq
        (call myRelay ("op" "identity") [])
        (seq
            (call node (serviceId "request") [url] result)
            (seq
                (call myRelay ("op" "identity") [])
                (call myPeerId ("_callback" callback) [result])
            )
        )
    )
    `;

    let callbackId = uuidv4();
    const data = new Map();
    data.set('node', node);
    data.set('serviceId', serviceId);
    data.set('myRelay', client.relayPeerId);
    data.set('myPeerId', client.selfPeerId);
    data.set('callback', callbackId);
    data.set('url', url);

    return await sendParticleAsFetch<any>(client, new Particle(script, data, ttl), callbackId);
};
