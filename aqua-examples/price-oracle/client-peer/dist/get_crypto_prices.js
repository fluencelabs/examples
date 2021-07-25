"use strict";
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
exports.get_price_par = exports.get_price = void 0;
var api_unstable_1 = require("@fluencelabs/fluence/dist/api.unstable");
function get_price(client, coin, currency, node, pg_sid, mean_sid, config) {
    return __awaiter(this, void 0, void 0, function () {
        var request, promise;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    promise = new Promise(function (resolve, reject) {
                        var r = new api_unstable_1.RequestFlowBuilder()
                            .disableInjections()
                            .withRawScript("\n(xor\n (seq\n  (seq\n   (seq\n    (seq\n     (seq\n      (seq\n       (seq\n        (seq\n         (seq\n          (call %init_peer_id% (\"getDataSrv\" \"-relay-\") [] -relay-)\n          (call %init_peer_id% (\"getDataSrv\" \"coin\") [] coin)\n         )\n         (call %init_peer_id% (\"getDataSrv\" \"currency\") [] currency)\n        )\n        (call %init_peer_id% (\"getDataSrv\" \"node\") [] node)\n       )\n       (call %init_peer_id% (\"getDataSrv\" \"pg_sid\") [] pg_sid)\n      )\n      (call %init_peer_id% (\"getDataSrv\" \"mean_sid\") [] mean_sid)\n     )\n     (call -relay- (\"op\" \"noop\") [])\n    )\n    (xor\n     (seq\n      (seq\n       (seq\n        (seq\n         (seq\n          (seq\n           (seq\n            (call node (\"op\" \"string_to_b58\") [node] k)\n            (call node (\"peer\" \"timestamp_ms\") [] ts_ms0)\n           )\n           (call node (pg_sid \"price_getter\") [coin currency ts_ms0] res0)\n          )\n          (call node (\"op\" \"identity\") [res0.$.result!] $prices)\n         )\n         (call node (\"peer\" \"timestamp_ms\") [] ts_ms1)\n        )\n        (call node (pg_sid \"price_getter\") [coin currency ts_ms1] res1)\n       )\n       (call node (\"op\" \"identity\") [res1.$.result!] $prices)\n      )\n      (call node (mean_sid \"mean\") [$prices] result)\n     )\n     (seq\n      (call -relay- (\"op\" \"noop\") [])\n      (call %init_peer_id% (\"errorHandlingSrv\" \"error\") [%last_error% 1])\n     )\n    )\n   )\n   (call -relay- (\"op\" \"noop\") [])\n  )\n  (xor\n   (call %init_peer_id% (\"callbackSrv\" \"response\") [result])\n   (call %init_peer_id% (\"errorHandlingSrv\" \"error\") [%last_error% 2])\n  )\n )\n (call %init_peer_id% (\"errorHandlingSrv\" \"error\") [%last_error% 3])\n)\n\n            ")
                            .configHandler(function (h) {
                            h.on('getDataSrv', '-relay-', function () {
                                return client.relayPeerId;
                            });
                            h.on('getDataSrv', 'coin', function () { return coin; });
                            h.on('getDataSrv', 'currency', function () { return currency; });
                            h.on('getDataSrv', 'node', function () { return node; });
                            h.on('getDataSrv', 'pg_sid', function () { return pg_sid; });
                            h.on('getDataSrv', 'mean_sid', function () { return mean_sid; });
                            h.onEvent('callbackSrv', 'response', function (args) {
                                var res = args[0];
                                resolve(res);
                            });
                            h.onEvent('errorHandlingSrv', 'error', function (args) {
                                // assuming error is the single argument
                                var err = args[0];
                                reject(err);
                            });
                        })
                            .handleScriptError(reject)
                            .handleTimeout(function () {
                            reject('Request timed out for get_price');
                        });
                        if (config === null || config === void 0 ? void 0 : config.ttl) {
                            r.withTTL(config.ttl);
                        }
                        request = r.build();
                    });
                    return [4 /*yield*/, client.initiateFlow(request)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, promise];
            }
        });
    });
}
exports.get_price = get_price;
function get_price_par(client, coin, currency, getter_topo, mean_topo, config) {
    return __awaiter(this, void 0, void 0, function () {
        var request, promise;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    promise = new Promise(function (resolve, reject) {
                        var r = new api_unstable_1.RequestFlowBuilder()
                            .disableInjections()
                            .withRawScript("\n(xor\n (seq\n  (seq\n   (seq\n    (seq\n     (seq\n      (seq\n       (seq\n        (seq\n         (seq\n          (seq\n           (call %init_peer_id% (\"getDataSrv\" \"-relay-\") [] -relay-)\n           (call %init_peer_id% (\"getDataSrv\" \"coin\") [] coin)\n          )\n          (call %init_peer_id% (\"getDataSrv\" \"currency\") [] currency)\n         )\n         (call %init_peer_id% (\"getDataSrv\" \"getter_topo\") [] getter_topo)\n        )\n        (call %init_peer_id% (\"getDataSrv\" \"mean_topo\") [] mean_topo)\n       )\n       (fold getter_topo topo\n        (par\n         (seq\n          (seq\n           (seq\n            (call -relay- (\"op\" \"noop\") [])\n            (xor\n             (seq\n              (seq\n               (seq\n                (call topo.$.node! (\"op\" \"string_to_b58\") [topo.$.node!] k)\n                (call topo.$.node! (\"peer\" \"timestamp_ms\") [] ts_ms)\n               )\n               (call topo.$.node! (topo.$.service_id! \"price_getter\") [coin currency ts_ms] res)\n              )\n              (call topo.$.node! (\"op\" \"identity\") [res.$.result!] $prices)\n             )\n             (seq\n              (call -relay- (\"op\" \"noop\") [])\n              (call %init_peer_id% (\"errorHandlingSrv\" \"error\") [%last_error% 1])\n             )\n            )\n           )\n           (call -relay- (\"op\" \"noop\") [])\n          )\n          (call %init_peer_id% (\"op\" \"noop\") [])\n         )\n         (next topo)\n        )\n       )\n      )\n      (call %init_peer_id% (\"op\" \"identity\") [$prices.$.[2]!])\n     )\n     (call -relay- (\"op\" \"noop\") [])\n    )\n    (xor\n     (seq\n      (call -relay- (\"op\" \"noop\") [])\n      (call mean_topo.$.node! (mean_topo.$.service_id! \"mean\") [$prices] result)\n     )\n     (seq\n      (call -relay- (\"op\" \"noop\") [])\n      (call %init_peer_id% (\"errorHandlingSrv\" \"error\") [%last_error% 2])\n     )\n    )\n   )\n   (call -relay- (\"op\" \"noop\") [])\n  )\n  (xor\n   (call %init_peer_id% (\"callbackSrv\" \"response\") [result])\n   (call %init_peer_id% (\"errorHandlingSrv\" \"error\") [%last_error% 3])\n  )\n )\n (call %init_peer_id% (\"errorHandlingSrv\" \"error\") [%last_error% 4])\n)\n\n            ")
                            .configHandler(function (h) {
                            h.on('getDataSrv', '-relay-', function () {
                                return client.relayPeerId;
                            });
                            h.on('getDataSrv', 'coin', function () { return coin; });
                            h.on('getDataSrv', 'currency', function () { return currency; });
                            h.on('getDataSrv', 'getter_topo', function () { return getter_topo; });
                            h.on('getDataSrv', 'mean_topo', function () { return mean_topo; });
                            h.onEvent('callbackSrv', 'response', function (args) {
                                var res = args[0];
                                resolve(res);
                            });
                            h.onEvent('errorHandlingSrv', 'error', function (args) {
                                // assuming error is the single argument
                                var err = args[0];
                                reject(err);
                            });
                        })
                            .handleScriptError(reject)
                            .handleTimeout(function () {
                            reject('Request timed out for get_price_par');
                        });
                        if (config === null || config === void 0 ? void 0 : config.ttl) {
                            r.withTTL(config.ttl);
                        }
                        request = r.build();
                    });
                    return [4 /*yield*/, client.initiateFlow(request)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, promise];
            }
        });
    });
}
exports.get_price_par = get_price_par;
