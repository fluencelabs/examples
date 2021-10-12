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

import { Fluence, setLogLevel, FluencePeer } from "@fluencelabs/fluence";
import { krasnodar, Node } from "@fluencelabs/fluence-network-environment";
import { add_one, add_one_par, add_one_three_times, add_one_par_alt } from "./compiled-aqua/adder";



interface NodeServiceTuple {
    node_id: string;
    service_id: string;
}

let topos: Array<NodeServiceTuple> = [
    {
        "node_id": "12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt",
        "service_id": "7b2ab89f-0897-4537-b726-8120b405074d"
    },
    {
        "node_id": "12D3KooWKnEqMfYo9zvfHmqTLpLdiHXPe4SVqUWcWHDJdFGrSmcA",
        "service_id": "e013f18a-200f-4249-8303-d42d10d3ce46"
    },
    {
        "node_id": "12D3KooWDUszU2NeWyUVjCXhGEt1MoZrhvdmaQQwtZUriuGN1jTr",
        "service_id": "191ef700-fd13-4151-9b7c-3fabfe3c0387"
    }
];

interface ValueNodeService {
    value: number,
    node_id: string;
    service_id: string;
}

let topos_alt: Array<ValueNodeService> = [
    {
        "value": 5,
        "node_id": "12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt",
        "service_id": "7b2ab89f-0897-4537-b726-8120b405074d"
    },
    {
        "value": 10,
        "node_id": "12D3KooWKnEqMfYo9zvfHmqTLpLdiHXPe4SVqUWcWHDJdFGrSmcA",
        "service_id": "e013f18a-200f-4249-8303-d42d10d3ce46"
    },
    {
        "value": 15,
        "node_id": "12D3KooWDUszU2NeWyUVjCXhGEt1MoZrhvdmaQQwtZUriuGN1jTr",
        "service_id": "191ef700-fd13-4151-9b7c-3fabfe3c0387"
    }
];

let value = 5;

// let greeting_service =

async function main() {
    // console.log("hello");
    // setLogLevel('DEBUG');

    await Fluence.start({ connectTo: krasnodar[2] });
    console.log(
        "created a Fluence client %s with relay %s",
        Fluence.getStatus().peerId,
        Fluence.getStatus().relayPeerId
    );

    let basic_add = await add_one(
        value,
        topos[0].node_id,
        topos[0].service_id
    );
    console.log("add_one to ", value, " equals ", basic_add);


    let seq_add = await add_one_three_times(
        value,
        topos
    );
    console.log("add_one sequentially equals ", seq_add);

    let par_add = await add_one_par(
        value,
        topos
    );
    console.log("add_one parallel equals ", par_add);

    let par_add_alt = await add_one_par_alt(
        topos_alt
    );
    console.log("add_one parallel alt equals ", par_add_alt);

    return;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });