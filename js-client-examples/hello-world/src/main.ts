import { Fluence, randomKras } from '@fluencelabs/js-client';
import { registerHelloWorld, sayHello, getRelayTime, tellFortune } from './aqua/hello-world.js';

export async function main() {
    await Fluence.connect(randomKras());

    registerHelloWorld({
        hello: (str) => {
            console.log(str);
        },
        getFortune: async () => {
            await new Promise((resolve) => {
                setTimeout(resolve, 1000);
            });
            return 'Wealth awaits you very soon.';
        },
    });

    await sayHello();

    console.log(await tellFortune());

    const relayTime = await getRelayTime();

    console.log('The relay time is: ', new Date(relayTime).toLocaleString());

    await Fluence.disconnect();
}
