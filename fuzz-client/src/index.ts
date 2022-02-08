/*
* Copyright 2022 Fluence Labs Limited
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

import { setLogLevel, Fluence } from "@fluencelabs/fluence";
import { krasnodar, Node } from "@fluencelabs/fluence-network-environment";
import { ts_getter, ts_getter_with_timeout } from "./_aqua/timestamp_gatherer";

async function main() {

  // create the Fluence client for the Krasnodar testnet
  // and we're using peer 6 to do so
  await Fluence.start({ connectTo: krasnodar[5] });
  console.log(
    "Created a fluence client with peer id %s and relay id %s",
    Fluence.getStatus().peerId,
    Fluence.getStatus().relayPeerId
  );

  // call the simple getter
  const ts_result = await ts_getter();
  console.log("simple result: ", ts_result);

  // call the bounded getter
  const ts_result_tuple = await ts_getter_with_timeout();
  console.log("raw timestamps: %s\ndead peers: %s ", ts_result_tuple[0].filter(e => e !== 0), ts_result_tuple[1]);


  await Fluence.stop();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
