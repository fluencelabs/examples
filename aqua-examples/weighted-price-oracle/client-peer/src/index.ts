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

import { setLogLevel, Fluence, KeyPair } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { get_weighted_price } from "./_aqua/get_crypto_prices";
import * as tg from "./_aqua/export";

const bs58 = require('bs58');

interface NodeServicePair {
  node: string;
  service_id: string;
}

let getter_topo: Array<NodeServicePair>;
let mean_topo: Array<NodeServicePair>;

// description of the services' locations, copypaste from data/deployed_services.json
getter_topo = [
  {
    node: "12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS",
    service_id: "7d495484-f0f0-4153-b4f0-fbb0fd162965"
  },
  {
    node: "12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi",
    service_id: "a79386c1-d6fc-4a41-ab5a-60599b151345"
  }
];
mean_topo = [
  {
    node: "12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS",
    service_id: "02fba79b-c72c-4ae6-b54b-8c7d871caf36"
  },
  {
    node: "12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi",
    service_id: "d4aef7ec-4d2b-4643-9d7b-93a63387f1f0"
  }
];

async function add_new_trust_checked(issued_for_peer_id: string, expires_at_sec: number) {
  let error = await tg.add_trust(issued_for_peer_id, expires_at_sec);
  if (error !== null) {
      console.error("%s", error);
  } else {
      console.log("Trust issued for %s successfully added", issued_for_peer_id)
  }
}

async function main() {
  console.log("hello crypto investors");

  // Uncomment to enable debug logs:
  // setLogLevel('DEBUG');

  // this key is bundled in all tg builtins
  // defined in https://github.com/fluencelabs/trust-graph/blob/master/example_secret_key.ed25519
  let sk = bs58.decode("E5ay3731i4HN8XjJozouV92RDMGAn3qSnb9dKSnujiWv").slice(0, 32); // first 32 bytes - secret key, second - public key
  let example_kp = await KeyPair.fromEd25519SK(sk);

  // create the Fluence client for the Krasnodar testnet
  await Fluence.start({ connectTo: krasnodar[0], KeyPair: example_kp });
  console.log(
    "created a fluence client %s with relay %s",
    Fluence.getStatus().peerId,
    Fluence.getStatus().relayPeerId
  );

  await add_new_trust_checked(getter_topo[0].node, 9999999999);
  await add_new_trust_checked(getter_topo[1].node, 9999999999);

  const weighted_price_result = await get_weighted_price("bitcoin", "usd", getter_topo, mean_topo[0]);
  console.log("get_weighted_price result: ", weighted_price_result);

  await Fluence.stop();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
