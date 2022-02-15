import { Fluence, KeyPair } from '@fluencelabs/fluence';
import { krasnodar } from '@fluencelabs/fluence-network-environment';
import { registerCalc, CalcDef } from './_aqua/calc';

class Calc implements CalcDef {
    private _state: number = 0;

    add(n: number) {
        this._state += n;
    }

    subtract(n: number) {
        this._state -= n;
    }

    multiply(n: number) {
        this._state *= n;
    }

    divide(n: number) {
        this._state /= n;
    }

    reset() {
        this._state = 0;
    }

    getResult() {
        return this._state;
    }
}

const relay = krasnodar[0];
// generated with `npx aqua create_keypair`
const skBytes = 'tOpsT08fvYMnRypj3VtSoqWMN5W/AptKsP39yanlkg4=';

export async function runServer() {
    await Fluence.start({
        connectTo: relay,
        KeyPair: await KeyPair.fromEd25519SK(Buffer.from(skBytes, 'base64')),
    });

    registerCalc(new Calc());

    console.log('application started');
    console.log('peer id is: ', Fluence.getStatus().peerId);
    console.log('relay is: ', Fluence.getStatus().relayPeerId);
    console.log('press any key to quit...');
}

export async function waitForKeypressAndStop() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', async () => {
        await Fluence.stop();
        process.exit(0);
    });
}
