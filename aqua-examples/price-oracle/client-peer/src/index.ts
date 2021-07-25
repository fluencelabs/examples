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

import { createClient, setLogLevel, FluenceClient } from "@fluencelabs/fluence";
import { krasnodar, Node } from "@fluencelabs/fluence-network-environment";
import { get_price, get_price_par } from "./get_crypto_prices";

interface NodeServicePair {
    node: string;
    service_id: string;

}

let getter_topo: Array<NodeServicePair>;
let mean_topo: NodeServicePair;

getter_topo = Array({ "node": "12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS", "service_id": "c315073d-4311-4db3-be57-8f154f032d28" }, { "node": "12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi", "service_id": "25f9123a-f386-4cb2-9c1e-bb7c247c9c09" });
mean_topo = { "node": "12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS", "service_id": "dd47389f-25d9-4870-a2a9-909359e73580" };

async function main() {
    console.log("hello crypto investors");
    // setLogLevel('DEBUG');
    const fluence = await createClient(krasnodar[2]);
    console.log("created a fluence client %s with relay %s", fluence.selfPeerId, fluence.relayPeerId);

    const network_result = await get_price(fluence, "ethereum", "usd", "12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi", "25f9123a-f386-4cb2-9c1e-bb7c247c9c09", "b2790307-055e-41ca-9640-3c41856d464b");
    console.log("seq result: ", network_result);

    const network_result_par = await get_price_par(fluence, "ethereum", "usd", getter_topo, mean_topo);
    console.log("par result: ", network_result_par);

    return;
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

