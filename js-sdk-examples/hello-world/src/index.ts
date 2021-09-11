import { Fluence } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import {
  registerHelloWorld,
  sayHello,
  getRelayTime,
} from "./_aqua/hello-world";

async function main() {
  await Fluence.start({ connectTo: krasnodar[0] });

  registerHelloWorld({
    hello: async (str) => {
      console.log(str);
    },
  });

  await sayHello();

  const relayTime = await getRelayTime();

  console.log("The relay time is: ", new Date(relayTime).toLocaleString());

  await Fluence.stop();
}

main();
