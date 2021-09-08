import { FluencePeer } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { registerCalc, CalcDef } from "./_aqua/calc";

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

const keypress = async () => {
  process.stdin.setRawMode(true);
  return new Promise<void>((resolve) =>
    process.stdin.once("data", () => {
      process.stdin.setRawMode(false);
      resolve();
    })
  );
};

async function main() {
  await FluencePeer.default.init({
    connectTo: krasnodar[0],
  });

  registerCalc(new Calc());

  console.log("application started");
  console.log("peer id is: ", FluencePeer.default.connectionInfo.selfPeerId);
  console.log("relay is: ", FluencePeer.default.connectionInfo.connectedRelay);
  console.log("press any key to continue");
  await keypress();

  await FluencePeer.default.uninit();
}

main();
