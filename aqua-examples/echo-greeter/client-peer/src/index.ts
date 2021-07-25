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
import {
    echo_greeting_seq,
    echo_greeting_seq_2,
    echo_greeting_par,
    echo_greeting_par_inverse,
    echo_greeting_par_greet,
    echo_greeting_par_inverse_greet,
} from "./echo_greeter";

interface NodeServicePair {
    node: string;
    service_id: string;
}

interface EchoService {
    node: string;
    service_id: string;
    names: Array<string>;
}

interface GreetingService {
    node: string;
    service_id: string;
    greet: boolean;
}

let greeting_topos: Array<NodeServicePair> = [
    {
        node: "12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt",
        service_id: "5cf520ff-dd65-47d7-a51a-2bf08dfe2ede",
    },
    {
        node: "12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE",
        service_id: "5a03906b-3217-40a2-93fb-7e83be735408",
    },
];
let echo_topos: Array<NodeServicePair> = [
    {
        node: "12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt",
        service_id: "fb5f7126-e1ee-4ecf-81e7-20804cb7203b",
    },
    {
        node: "12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE",
        service_id: "893a6fb8-43b9-4b11-8786-93300bd68bc8",
    },
];
let echo_service: EchoService = {
    node: echo_topos[0].node,
    service_id: echo_topos[0].service_id,
    names: ["Jim", "John", "Jake"],
};
let greeting_services: Array<GreetingService> = [
    {
        node: greeting_topos[0].node,
        service_id: greeting_topos[0].service_id,
        greet: true,
    },
    {
        node: greeting_topos[1].node,
        service_id: greeting_topos[1].service_id,
        greet: false,
    },
];

let names: Array<string> = ["Jim", "John", "Jake"];

// let greeting_service =

async function main() {
    // console.log("hello");
    // setLogLevel('DEBUG');

    const fluence = await createClient(krasnodar[2]);
    console.log(
        "created a fluence client %s with relay %s",
        fluence.selfPeerId,
        fluence.relayPeerId
    );

    let network_result = await echo_greeting_seq(
        fluence,
        names,
        true,
        echo_topos[0].node,
        echo_topos[0].service_id,
        greeting_topos[0].service_id
    );
    console.log("seq result                         : ", network_result);


    network_result = await echo_greeting_seq_2(
        fluence,
        names,
        true,
        echo_topos[0],
        greeting_topos[0]
    );
    console.log("seq result with improved signature : ", network_result);

    // echo_greeting_par(greet: bool, echo_service: EchoServiceInput, greeting_services: []NodeServicePair) -> []string:
    network_result = await echo_greeting_par(
        fluence,
        true,
        echo_service,
        greeting_topos
    );
    console.log("par result                         : ", network_result);

    network_result = await echo_greeting_par_inverse(
        fluence,
        true,
        echo_service,
        greeting_services
    );
    console.log("par inverse result                  : ", network_result);

    network_result = await echo_greeting_par_greet(
        fluence,
        echo_service,
        greeting_services
    );
    console.log("par result with greet variation    : ", network_result);

    network_result = await echo_greeting_par_inverse_greet(
        fluence,
        echo_service,
        greeting_services
    );
    console.log("par inverse result with greet variation    : ", network_result);


    return;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
