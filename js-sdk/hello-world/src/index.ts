import { FluencePeer } from "@fluencelabs/fluence";
import { registerHelloWorld, sayHello } from "./_aqua/hello-world";

async function main() {
  await FluencePeer.default.init();

  registerHelloWorld({
    hello: async (str) => {
      console.log(str);
    },
  });

  await sayHello();

  await FluencePeer.default.uninit();
}

main();
