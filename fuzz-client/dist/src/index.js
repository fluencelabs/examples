"use strict";
/*
* Copyright 2021 Fluence Labs Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fluence_1 = require("@fluencelabs/fluence");
var fluence_network_environment_1 = require("@fluencelabs/fluence-network-environment");
var timestamp_gatherer_1 = require("./_aqua/timestamp_gatherer");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var ts_result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // create the Fluence client for the Krasnodar testnet
                return [4 /*yield*/, fluence_1.Fluence.start({ connectTo: fluence_network_environment_1.krasnodar[5] })];
                case 1:
                    // create the Fluence client for the Krasnodar testnet
                    _a.sent();
                    console.log("Created a fluence client with peer id %s and relay id %s", fluence_1.Fluence.getStatus().peerId, fluence_1.Fluence.getStatus().relayPeerId);
                    return [4 /*yield*/, timestamp_gatherer_1.ts_getter()];
                case 2:
                    ts_result = _a.sent();
                    console.log("simple result: ", ts_result);
                    // call the get_price_par function -- parallel processing
                    // func get_price_par(coin: string, currency: string, getter_topo: []NodeServicePair, mean_topo: NodeServicePair) -> Result:
                    // const network_result_par = await get_price_par("ethereum", "usd", getter_topo, mean_topo[0]
                    // );
                    // console.log("par result: ", network_result_par);
                    return [4 /*yield*/, fluence_1.Fluence.stop()];
                case 3:
                    // call the get_price_par function -- parallel processing
                    // func get_price_par(coin: string, currency: string, getter_topo: []NodeServicePair, mean_topo: NodeServicePair) -> Result:
                    // const network_result_par = await get_price_par("ethereum", "usd", getter_topo, mean_topo[0]
                    // );
                    // console.log("par result: ", network_result_par);
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .then(function () { return process.exit(0); })
    .catch(function (error) {
    console.error(error);
    process.exit(1);
});
