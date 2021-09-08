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
var echo_greeter_1 = require("./echo_greeter");
var greeting_topos = [
    {
        node: "12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt",
        service_id: "5cf520ff-dd65-47d7-a51a-2bf08dfe2ede",
    },
    {
        node: "12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE",
        service_id: "5a03906b-3217-40a2-93fb-7e83be735408",
    },
];
var echo_topos = [
    {
        node: "12D3KooWFtf3rfCDAfWwt6oLZYZbDfn9Vn7bv7g6QjjQxUUEFVBt",
        service_id: "fb5f7126-e1ee-4ecf-81e7-20804cb7203b",
    },
    {
        node: "12D3KooWJd3HaMJ1rpLY1kQvcjRPEvnDwcXrH8mJvk7ypcZXqXGE",
        service_id: "893a6fb8-43b9-4b11-8786-93300bd68bc8",
    },
];
var echo_service = {
    node: echo_topos[0].node,
    service_id: echo_topos[0].service_id,
    names: ["Jim", "John", "Jake"],
};
var greeting_services = [
    {
        node: greeting_topos[0].node,
        service_id: greeting_topos[0].service_id,
        greet: true,
    },
    {
        node: greeting_topos[1].node,
        service_id: greeting_topos[1].service_id,
        greet: false,
    },
];
var names = ["Jim", "John", "Jake"];
// let greeting_service =
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var fluence, echo_result, result, _i, echo_result_1, item, greeting_result, seq_result, par_result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fluence_1.createClient(fluence_network_environment_1.krasnodar[2])];
                case 1:
                    fluence = _a.sent();
                    console.log("created a fluence client %s with relay %s", fluence.selfPeerId, fluence.relayPeerId);
                    return [4 /*yield*/, echo_greeter_1.echo(fluence, names, echo_topos[0].node, echo_topos[0].service_id)];
                case 2:
                    echo_result = _a.sent();
                    result = "";
                    for (_i = 0, echo_result_1 = echo_result; _i < echo_result_1.length; _i++) {
                        item = echo_result_1[_i];
                        result += item.echo + ",";
                    }
                    console.log("echo result                       : ", result);
                    return [4 /*yield*/, echo_greeter_1.greeting(fluence, names[0], true, greeting_topos[0].node, greeting_topos[0].service_id)];
                case 3:
                    greeting_result = _a.sent();
                    console.log("greeting result                   : ", greeting_result);
                    return [4 /*yield*/, echo_greeter_1.echo_greeting_seq(fluence, names, true, echo_topos[0].node, echo_topos[0].service_id, greeting_topos[0].service_id)];
                case 4:
                    seq_result = _a.sent();
                    console.log("seq result                         : ", seq_result);
                    return [4 /*yield*/, echo_greeter_1.echo_greeting_par(fluence, true, echo_service, greeting_services)];
                case 5:
                    par_result = _a.sent();
                    console.log("par result                          : ", par_result);
                    return [4 /*yield*/, echo_greeter_1.echo_greeting_par_alternative(fluence, true, echo_service, greeting_services)];
                case 6:
                    par_result = _a.sent();
                    console.log("par alternative result              : ", par_result);
                    return [4 /*yield*/, echo_greeter_1.echo_greeting_par_improved(fluence, echo_service, greeting_services)];
                case 7:
                    par_result = _a.sent();
                    console.log("par improved signature result        : ", par_result);
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
