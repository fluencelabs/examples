import { FluencePeer } from "@fluencelabs/fluence";
import { registerCalc, demoCalculation } from "./_aqua/calc";

class Calc {
  private _state: number = 0;

  async add(n: number) {
    this._state += n;
  }

  async subtract(n: number) {
    this._state -= n;
  }

  async multiply(n: number) {
    this._state *= n;
  }

  async divide(n: number) {
    this._state /= n;
  }

  async reset() {
    this._state = 0;
  }

  async getResult() {
    return this._state;
  }
}

async function main() {
  await FluencePeer.default.init();

  registerCalc(new Calc());

  const res = await demoCalculation();

  console.log("Calculation result is: ", res);

  await FluencePeer.default.uninit();
}

main();
