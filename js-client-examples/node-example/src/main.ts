import { Fluence, kras } from '@fluencelabs/js-client';
import { registerCalc, CalcDef } from './_aqua/calc.js';

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

const relay = kras[0];

// generated with `npx aqua create_keypair`
const skBase64 = 'tOpsT08fvYMnRypj3VtSoqWMN5W/AptKsP39yanlkg4=';

export async function runServer() {
    const skBytes = Buffer.from(skBase64, 'base64');

    await Fluence.connect(relay, {
        keyPair: {
            type: 'Ed25519',
            source: Uint8Array.from(skBytes),
        },
    });

    registerCalc(new Calc());

    const client = await Fluence.getClient();

    console.log('application started');
    console.log('peer id is: ', client.getPeerId());
    console.log('relay is: ', client.getRelayPeerId());
    console.log('press any key to quit...');
}

export async function justStop() {
    await Fluence.disconnect();
}

export async function waitForKeypressAndStop() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', async () => {
        await Fluence.disconnect();
        process.exit(0);
    });
}
