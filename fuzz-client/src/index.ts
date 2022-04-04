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
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { collect_timestamps_from_neighborhood } from "./_aqua/timestamp_gatherer";

async function main() {
  if (process.env.DEBUG === 'true') {
    setLogLevel("DEBUG");
  }

  // Connect to the address specified by environment variable RELAY or use krasnodar[5] if not set
  let relay = process.env.RELAY || krasnodar[5];

  await Fluence.start({ connectTo: relay });
  console.log(
    "Created a fluence client with peer id %s and relay id %s",
    Fluence.getStatus().peerId,
    Fluence.getStatus().relayPeerId
  );

  // call the simple getter
  const [timestamps, dead_peers] = await collect_timestamps_from_neighborhood();
  console.log("timestamps: %s", timestamps);
  console.log("dead peers: %s ", dead_peers);

  await Fluence.stop();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
