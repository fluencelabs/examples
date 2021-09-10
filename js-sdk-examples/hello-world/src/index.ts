import { Fluence } from "@fluencelabs/fluence";
import { registerHelloWorld, sayHello } from "./_aqua/hello-world";

async function main() {
  await Fluence.start();

  registerHelloWorld({
    hello: async (str) => {
      console.log(str);
    },
  });

  await sayHello();

  await Fluence.stop();
}

main();
