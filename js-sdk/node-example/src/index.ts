import { FluencePeer } from "@fluencelabs/fluence";
import { registerCalc, CalcDef, demoCalculation } from "./_aqua/calc";

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

async function main() {
  await FluencePeer.default.init();

  registerCalc(new Calc());

  const res = await demoCalculation();

  console.log("Calculation result is: ", res);

  await FluencePeer.default.uninit();
}

main();
