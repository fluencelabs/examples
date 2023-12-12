/* eslint-disable */
// @ts-nocheck
/**
 *
 * This file is generated using:
 * @fluencelabs/aqua-api version: 0.12.0
 * @fluencelabs/aqua-to-js version: 0.1.0
 * If you find any bugs in generated AIR, please write an issue on GitHub: https://github.com/fluencelabs/aqua/issues
 * If you find any bugs in generated JS/TS, please write an issue on GitHub: https://github.com/fluencelabs/js-client/issues
 *
 */
import type { IFluenceClient as IFluenceClient$$, CallParams as CallParams$$ } from '@fluencelabs/js-client';

import {
    v5_callFunction as callFunction$$,
    v5_registerService as registerService$$,
} from '@fluencelabs/js-client';

// Services
export interface DebugDef {
    stringify: (message: string, callParams: CallParams$$<'message'>) => void | Promise<void>;
}
export function registerDebug(service: DebugDef): void;
export function registerDebug(serviceId: string, service: DebugDef): void;
export function registerDebug(peer: IFluenceClient$$, service: DebugDef): void;
export function registerDebug(peer: IFluenceClient$$, serviceId: string, service: DebugDef): void;
export function registerDebug(...args: any[]) {
    registerService$$(
        args,
        {
    "defaultServiceId": "debug",
    "functions": {
        "fields": {
            "stringify": {
                "domain": {
                    "fields": {
                        "message": {
                            "name": "string",
                            "tag": "scalar"
                        }
                    },
                    "tag": "labeledProduct"
                },
                "codomain": {
                    "tag": "nil"
                },
                "tag": "arrow"
            }
        },
        "tag": "labeledProduct"
    }
}
    );
}

export interface GreetingDef {
    greeting: (name: string, callParams: CallParams$$<'name'>) => string | Promise<string>;
}
export function registerGreeting(service: GreetingDef): void;
export function registerGreeting(serviceId: string, service: GreetingDef): void;
export function registerGreeting(peer: IFluenceClient$$, service: GreetingDef): void;
export function registerGreeting(peer: IFluenceClient$$, serviceId: string, service: GreetingDef): void;
export function registerGreeting(...args: any[]) {
    registerService$$(
        args,
        {
    "functions": {
        "fields": {
            "greeting": {
                "domain": {
                    "fields": {
                        "name": {
                            "name": "string",
                            "tag": "scalar"
                        }
                    },
                    "tag": "labeledProduct"
                },
                "codomain": {
                    "items": [
                        {
                            "name": "string",
                            "tag": "scalar"
                        }
                    ],
                    "tag": "unlabeledProduct"
                },
                "tag": "arrow"
            }
        },
        "tag": "labeledProduct"
    }
}
    );
}


// Functions
export const my_hello_script = `
(xor
 (seq
  (seq
   (seq
    (seq
     (seq
      (call %init_peer_id% ("getDataSrv" "-relay-") [] -relay-)
      (call %init_peer_id% ("getDataSrv" "name") [] -name-arg-)
     )
     (call %init_peer_id% ("getDataSrv" "wasm_content") [] -wasm_content-arg-)
    )
    (call %init_peer_id% ("single_module_srv" "create") [-wasm_content-arg-] ret)
   )
   (call %init_peer_id% (ret.$.service_id.[0] "greeting") [-name-arg-] ret-0)
  )
  (call %init_peer_id% ("callbackSrv" "response") [ret-0])
 )
 (call %init_peer_id% ("errorHandlingSrv" "error") [:error: 0])
)
`;

export function my_hello(
    name: string,
    wasm_content: string,
    config?: {ttl?: number}
): Promise<string>;

export function my_hello(
    peer: IFluenceClient$$,
    name: string,
    wasm_content: string,
    config?: {ttl?: number}
): Promise<string>;

export function my_hello(...args: any[]) {
    return callFunction$$(
        args,
        {
    "functionName": "my_hello",
    "arrow": {
        "domain": {
            "fields": {
                "name": {
                    "name": "string",
                    "tag": "scalar"
                },
                "wasm_content": {
                    "name": "string",
                    "tag": "scalar"
                }
            },
            "tag": "labeledProduct"
        },
        "codomain": {
            "items": [
                {
                    "name": "string",
                    "tag": "scalar"
                }
            ],
            "tag": "unlabeledProduct"
        },
        "tag": "arrow"
    },
    "names": {
        "relay": "-relay-",
        "getDataSrv": "getDataSrv",
        "callbackSrv": "callbackSrv",
        "responseSrv": "callbackSrv",
        "responseFnName": "response",
        "errorHandlingSrv": "errorHandlingSrv",
        "errorFnName": "error"
    }
},
        my_hello_script
    );
}
