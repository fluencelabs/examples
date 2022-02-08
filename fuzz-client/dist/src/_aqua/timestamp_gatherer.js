"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ts_getter_with_timeout = exports.ts_getter = void 0;
var v2_1 = require("@fluencelabs/fluence/dist/internal/compilerSupport/v2");
function ts_getter() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var script = "\n                    (xor\n                     (seq\n                      (seq\n                       (call %init_peer_id% (\"getDataSrv\" \"-relay-\") [] -relay-)\n                       (new $res\n                        (seq\n                         (xor\n                          (seq\n                           (seq\n                            (seq\n                             (call -relay- (\"op\" \"string_to_b58\") [-relay-] k)\n                             (call -relay- (\"kad\" \"neighborhood\") [k [] []] nodes)\n                            )\n                            (par\n                             (fold nodes n\n                              (par\n                               (seq\n                                (xor\n                                 (call n (\"peer\" \"timestamp_ms\") [] $res)\n                                 (seq\n                                  (call -relay- (\"op\" \"noop\") [])\n                                  (call %init_peer_id% (\"errorHandlingSrv\" \"error\") [%last_error% 1])\n                                 )\n                                )\n                                (call -relay- (\"op\" \"noop\") [])\n                               )\n                               (next n)\n                              )\n                             )\n                             (null)\n                            )\n                           )\n                           (call -relay- (\"op\" \"noop\") [$res.$.[9]!])\n                          )\n                          (call %init_peer_id% (\"errorHandlingSrv\" \"error\") [%last_error% 2])\n                         )\n                         (call %init_peer_id% (\"op\" \"identity\") [$res] res-fix)\n                        )\n                       )\n                      )\n                      (xor\n                       (call %init_peer_id% (\"callbackSrv\" \"response\") [res-fix])\n                       (call %init_peer_id% (\"errorHandlingSrv\" \"error\") [%last_error% 3])\n                      )\n                     )\n                     (call %init_peer_id% (\"errorHandlingSrv\" \"error\") [%last_error% 4])\n                    )\n    ";
    return v2_1.callFunction(args, {
        "functionName": "ts_getter",
        "returnType": {
            "tag": "primitive"
        },
        "argDefs": [],
        "names": {
            "relay": "-relay-",
            "getDataSrv": "getDataSrv",
            "callbackSrv": "callbackSrv",
            "responseSrv": "callbackSrv",
            "responseFnName": "response",
            "errorHandlingSrv": "errorHandlingSrv",
            "errorFnName": "error"
        }
    }, script);
}
exports.ts_getter = ts_getter;
function ts_getter_with_timeout() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var script = "\n                    (xor\n                     (seq\n                      (seq\n                       (call %init_peer_id% (\"getDataSrv\" \"-relay-\") [] -relay-)\n                       (new $res\n                        (seq\n                         (new $dead_peers\n                          (seq\n                           (xor\n                            (seq\n                             (seq\n                              (seq\n                               (call -relay- (\"op\" \"string_to_b58\") [-relay-] k)\n                               (call -relay- (\"kad\" \"neighborhood\") [k [] []] nodes)\n                              )\n                              (par\n                               (fold nodes n\n                                (par\n                                 (new $status\n                                  (seq\n                                   (seq\n                                    (par\n                                     (xor\n                                      (seq\n                                       (call n (\"peer\" \"timestamp_ms\") [] $res)\n                                       (ap \"success\" $status)\n                                      )\n                                      (seq\n                                       (call -relay- (\"op\" \"noop\") [])\n                                       (call %init_peer_id% (\"errorHandlingSrv\" \"error\") [%last_error% 1])\n                                      )\n                                     )\n                                     (call -relay- (\"peer\" \"timeout\") [1000 \"timeout\"] $status)\n                                    )\n                                    (xor\n                                     (mismatch $status.$.[0]! \"success\"\n                                      (xor\n                                       (seq\n                                        (ap 0 $res)\n                                        (ap n $dead_peers)\n                                       )\n                                       (call %init_peer_id% (\"errorHandlingSrv\" \"error\") [%last_error% 2])\n                                      )\n                                     )\n                                     (null)\n                                    )\n                                   )\n                                   (call -relay- (\"op\" \"noop\") [])\n                                  )\n                                 )\n                                 (next n)\n                                )\n                               )\n                               (null)\n                              )\n                             )\n                             (call -relay- (\"op\" \"noop\") [$res.$.[19]!])\n                            )\n                            (call %init_peer_id% (\"errorHandlingSrv\" \"error\") [%last_error% 3])\n                           )\n                           (call %init_peer_id% (\"op\" \"identity\") [$dead_peers] dead_peers-fix)\n                          )\n                         )\n                         (call %init_peer_id% (\"op\" \"identity\") [$res] res-fix)\n                        )\n                       )\n                      )\n                      (xor\n                       (call %init_peer_id% (\"callbackSrv\" \"response\") [res-fix dead_peers-fix])\n                       (call %init_peer_id% (\"errorHandlingSrv\" \"error\") [%last_error% 4])\n                      )\n                     )\n                     (call %init_peer_id% (\"errorHandlingSrv\" \"error\") [%last_error% 5])\n                    )\n    ";
    return v2_1.callFunction(args, {
        "functionName": "ts_getter_with_timeout",
        "returnType": {
            "tag": "multiReturn",
            "returnItems": [
                {
                    "tag": "primitive"
                },
                {
                    "tag": "primitive"
                }
            ]
        },
        "argDefs": [],
        "names": {
            "relay": "-relay-",
            "getDataSrv": "getDataSrv",
            "callbackSrv": "callbackSrv",
            "responseSrv": "callbackSrv",
            "responseFnName": "response",
            "errorHandlingSrv": "errorHandlingSrv",
            "errorFnName": "error"
        }
    }, script);
}
exports.ts_getter_with_timeout = ts_getter_with_timeout;
