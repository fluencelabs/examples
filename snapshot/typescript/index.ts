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
// import { ethers } from "ethers";
import { ts_getter } from "./timestamp_getter";


function timestamp_delta(proposal_ts_ms: number, network_ts_ms: number[]): Map<string, Array<number>> {

    const acceptable_ts_diff: number = 60 * 1_000; // 1 Minute
    let valid_ts: Array<number> = [];
    let invalid_ts: Array<number> = [];

    for (var t of network_ts_ms) {
        let threshold_ts: number = t + acceptable_ts_diff;
        console.log(t, threshold_ts);

        if (threshold_ts > proposal_ts_ms) {
            // results.get("valid"); // .valid_ts.push(t);
            valid_ts.push(t);
        }
        else {
            // results.set("invalid", invalid_ts.push(t));
            invalid_ts.push(t);
        }

    }

    console.log("valid_ts: ", valid_ts);
    console.log("invalid_ts: ", invalid_ts);

    let results = new Map<string, Array<number>>();
    results.set("valid", valid_ts);
    results.set("invalid", invalid_ts);
    return results;
}

async function main() {
    console.log("hello");
    // setLogLevel('DEBUG');
    const fluence = await createClient(krasnodar[2]);
    // console.log("created a fluence client %s with relay %s", fluence.selfPeerId, fluence.relayPeerId);

    const network_result = await ts_getter(fluence, krasnodar[2].peerId);
    console.log(network_result);
    console.log(network_result[5]);

    var now = new Date;
    var utc_ts = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
        now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
    console.log(utc_ts);

    const ts_diffs = timestamp_delta(utc_ts, network_result);
    console.log(ts_diffs);

    if (ts_diffs.has("valid") && ts_diffs.has("invalid")) {
        let valid_ts = ts_diffs.get("valid")?.length;
        let invalid_ts = ts_diffs.get("invalid")?.length;

        console.log(valid_ts, invalid_ts);

        if (valid_ts !== undefined && invalid_ts !== undefined && (valid_ts / (valid_ts + invalid_ts)) >= (2 / 3)) {
            console.log("consensus");
        }
        else {
            console.log("no consensus");
        }

    }
    else {
        console.log("error: something went wrong with getting our timestamp validated");
    }

    return;
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

