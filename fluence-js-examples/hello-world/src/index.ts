import { Fluence } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import {
  registerHelloWorld,
  sayHello,
  getRelayTime,
  tellFortune,
} from "./_aqua/hello-world";

async function main() {
  await Fluence.start({ connectTo: krasnodar[0] });

  registerHelloWorld({
    hello: (str) => {
      console.log(str);
    },
    getFortune: async () => {
      await new Promise(resolve => {
        setTimeout(resolve, 1000)
      })
      return "Wealth awaits you very soon."
  });

  await sayHello();

  console.log(await tellFortune());

  const relayTime = await getRelayTime();

  console.log("The relay time is: ", new Date(relayTime).toLocaleString());

  await Fluence.stop();
}

main();
