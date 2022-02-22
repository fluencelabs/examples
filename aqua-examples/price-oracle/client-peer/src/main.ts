/*
 * Copyright 2021 Fluence Labs Limited
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

import { setLogLevel, Fluence } from '@fluencelabs/fluence';
import { krasnodar, Node } from '@fluencelabs/fluence-network-environment';
import { get_price, get_price_par } from './_aqua/get_crypto_prices';

interface NodeServicePair {
    node: string;
    service_id: string;
}

let getter_topo: Array<NodeServicePair>;
let mean_topo: Array<NodeServicePair>;

// description of the services' locations, copypaste from data/deployed_services.json
getter_topo = [
    {
        node: '12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS',
        service_id: 'b67586f7-e96f-49ee-914e-9eabe1a0b83d',
    },
    {
        node: '12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi',
        service_id: 'f5b456fa-ee18-4df1-b18b-84fe7ebc7ad0',
    },
];

mean_topo = [
    {
        node: '12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS',
        service_id: '79b8ddb9-e2e6-4924-9293-c5d55c94af6b',
    },
    {
        node: '12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi',
        service_id: 'debecd02-ba7d-40a2-92ab-08a9321da2cf',
    },
];

export async function main() {
    console.log('hello crypto investors');

    // Uncomment to enable debug logs:
    // setLogLevel('DEBUG');

    // create the Fluence client for the Krasnodar testnet
    await Fluence.start({ connectTo: krasnodar[5] });
    console.log(
        'Created a fluence client with peer id %s and relay id %s',
        Fluence.getStatus().peerId,
        Fluence.getStatus().relayPeerId,
    );

    // call the get_price function -- sequential processing
    const network_result = await get_price(
        'ethereum',
        'usd',
        getter_topo[1].node,
        getter_topo[1].service_id,
        mean_topo[1].service_id,
    );
    console.log('seq result: ', network_result);

    // call the get_price_par function -- parallel processing
    // func get_price_par(coin: string, currency: string, getter_topo: []NodeServicePair, mean_topo: NodeServicePair) -> Result:
    const network_result_par = await get_price_par('ethereum', 'usd', getter_topo, mean_topo[0]);
    console.log('par result: ', network_result_par);

    await Fluence.stop();
}
