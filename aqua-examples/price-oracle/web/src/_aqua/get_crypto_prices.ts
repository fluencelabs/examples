/**
 *
 * This file is auto-generated. Do not edit manually: changes may be erased.
 * Generated by Aqua compiler: https://github.com/fluencelabs/aqua/.
 * If you find any bugs, please write an issue on GitHub: https://github.com/fluencelabs/aqua/issues
 * Aqua version: 0.6.0-277
 *
 */
import { Fluence, FluencePeer } from '@fluencelabs/fluence';
import {
    CallParams,
    callFunction,
    registerService,
} from '@fluencelabs/fluence/dist/internal/compilerSupport/v2';


// Services

export interface MeanServiceDef {
    mean: (data: number[], callParams: CallParams<'data'>) => { error_msg: string; result: number; success: boolean; } | Promise<{ error_msg: string; result: number; success: boolean; }>;
}
export function registerMeanService(serviceId: string, service: MeanServiceDef): void;
export function registerMeanService(peer: FluencePeer, serviceId: string, service: MeanServiceDef): void;
       

export function registerMeanService(...args: any) {
    registerService(
        args,
        {
    "functions" : [
        {
            "functionName" : "mean",
            "argDefs" : [
                {
                    "name" : "data",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        }
    ]
}
    );
}
      


export interface F64OpDef {
    identity: (x: number, callParams: CallParams<'x'>) => number | Promise<number>;
}
export function registerF64Op(service: F64OpDef): void;
export function registerF64Op(serviceId: string, service: F64OpDef): void;
export function registerF64Op(peer: FluencePeer, service: F64OpDef): void;
export function registerF64Op(peer: FluencePeer, serviceId: string, service: F64OpDef): void;
       

export function registerF64Op(...args: any) {
    registerService(
        args,
        {
    "defaultServiceId" : "op",
    "functions" : [
        {
            "functionName" : "identity",
            "argDefs" : [
                {
                    "name" : "x",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        }
    ]
}
    );
}
      


export interface PriceGetterServiceDef {
    price_getter: (coin: string, currency: string, timestamp_ms: number, callParams: CallParams<'coin' | 'currency' | 'timestamp_ms'>) => { error_msg: string; result: number; success: boolean; } | Promise<{ error_msg: string; result: number; success: boolean; }>;
}
export function registerPriceGetterService(serviceId: string, service: PriceGetterServiceDef): void;
export function registerPriceGetterService(peer: FluencePeer, serviceId: string, service: PriceGetterServiceDef): void;
       

export function registerPriceGetterService(...args: any) {
    registerService(
        args,
        {
    "functions" : [
        {
            "functionName" : "price_getter",
            "argDefs" : [
                {
                    "name" : "coin",
                    "argType" : {
                        "tag" : "primitive"
                    }
                },
                {
                    "name" : "currency",
                    "argType" : {
                        "tag" : "primitive"
                    }
                },
                {
                    "name" : "timestamp_ms",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        }
    ]
}
    );
}
      
// Functions
export type Get_price_parArgMean_topo = { node: string; service_id: string; } 
export type Get_price_parResult = { error_msg: string; result: number; success: boolean; }
export function get_price_par(
    coin: string,
    currency: string,
    getter_topo: { node: string; service_id: string; }[],
    mean_topo: Get_price_parArgMean_topo,
    config?: {ttl?: number}
): Promise<Get_price_parResult>;

export function get_price_par(
    peer: FluencePeer,
    coin: string,
    currency: string,
    getter_topo: { node: string; service_id: string; }[],
    mean_topo: Get_price_parArgMean_topo,
    config?: {ttl?: number}
): Promise<Get_price_parResult>;

export function get_price_par(...args: any) {

    let script = `
                    (xor
                     (seq
                      (seq
                       (seq
                        (seq
                         (seq
                          (seq
                           (call %init_peer_id% ("getDataSrv" "-relay-") [] -relay-)
                           (call %init_peer_id% ("getDataSrv" "coin") [] coin)
                          )
                          (call %init_peer_id% ("getDataSrv" "currency") [] currency)
                         )
                         (call %init_peer_id% ("getDataSrv" "getter_topo") [] getter_topo)
                        )
                        (call %init_peer_id% ("getDataSrv" "mean_topo") [] mean_topo)
                       )
                       (new $prices
                        (seq
                         (par
                          (fold getter_topo topo
                           (par
                            (seq
                             (seq
                              (call -relay- ("op" "noop") [])
                              (xor
                               (seq
                                (seq
                                 (seq
                                  (call topo.$.node! ("peer" "timestamp_ms") [] ts_ms)
                                  (call topo.$.node! (topo.$.service_id! "price_getter") [coin currency ts_ms] res)
                                 )
                                 (call topo.$.node! ("op" "identity") [res.$.result!] $prices)
                                )
                                (call topo.$.node! ("op" "noop") [])
                               )
                               (seq
                                (call -relay- ("op" "noop") [])
                                (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 1])
                               )
                              )
                             )
                             (call mean_topo.$.node! ("op" "noop") [])
                            )
                            (next topo)
                           )
                          )
                          (null)
                         )
                         (xor
                          (seq
                           (seq
                            (call mean_topo.$.node! ("op" "identity") [$prices.$.[1]!])
                            (call mean_topo.$.node! (mean_topo.$.service_id! "mean") [$prices] result)
                           )
                           (call -relay- ("op" "noop") [])
                          )
                          (seq
                           (call -relay- ("op" "noop") [])
                           (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 2])
                          )
                         )
                        )
                       )
                      )
                      (xor
                       (call %init_peer_id% ("callbackSrv" "response") [result])
                       (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 3])
                      )
                     )
                     (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 4])
                    )
    `
    return callFunction(
        args,
        {
    "functionName" : "get_price_par",
    "returnType" : {
        "tag" : "primitive"
    },
    "argDefs" : [
        {
            "name" : "coin",
            "argType" : {
                "tag" : "primitive"
            }
        },
        {
            "name" : "currency",
            "argType" : {
                "tag" : "primitive"
            }
        },
        {
            "name" : "getter_topo",
            "argType" : {
                "tag" : "primitive"
            }
        },
        {
            "name" : "mean_topo",
            "argType" : {
                "tag" : "primitive"
            }
        }
    ],
    "names" : {
        "relay" : "-relay-",
        "getDataSrv" : "getDataSrv",
        "callbackSrv" : "callbackSrv",
        "responseSrv" : "callbackSrv",
        "responseFnName" : "response",
        "errorHandlingSrv" : "errorHandlingSrv",
        "errorFnName" : "error"
    }
},
        script
    )
}

 
export type Get_priceResult = { error_msg: string; result: number; success: boolean; }
export function get_price(
    coin: string,
    currency: string,
    node: string,
    pg_sid: string,
    mean_sid: string,
    config?: {ttl?: number}
): Promise<Get_priceResult>;

export function get_price(
    peer: FluencePeer,
    coin: string,
    currency: string,
    node: string,
    pg_sid: string,
    mean_sid: string,
    config?: {ttl?: number}
): Promise<Get_priceResult>;

export function get_price(...args: any) {

    let script = `
                    (xor
                     (seq
                      (seq
                       (seq
                        (seq
                         (seq
                          (seq
                           (seq
                            (call %init_peer_id% ("getDataSrv" "-relay-") [] -relay-)
                            (call %init_peer_id% ("getDataSrv" "coin") [] coin)
                           )
                           (call %init_peer_id% ("getDataSrv" "currency") [] currency)
                          )
                          (call %init_peer_id% ("getDataSrv" "node") [] node)
                         )
                         (call %init_peer_id% ("getDataSrv" "pg_sid") [] pg_sid)
                        )
                        (call %init_peer_id% ("getDataSrv" "mean_sid") [] mean_sid)
                       )
                       (new $prices
                        (seq
                         (call -relay- ("op" "noop") [])
                         (xor
                          (seq
                           (seq
                            (seq
                             (seq
                              (seq
                               (seq
                                (seq
                                 (seq
                                  (call node ("op" "string_to_b58") [node] k)
                                  (call node ("peer" "timestamp_ms") [] ts_ms0)
                                 )
                                 (call node (pg_sid "price_getter") [coin currency ts_ms0] res0)
                                )
                                (call node ("op" "identity") [res0.$.result!] $prices)
                               )
                               (call node ("peer" "timestamp_ms") [] ts_ms1)
                              )
                              (call node (pg_sid "price_getter") [coin currency ts_ms1] res1)
                             )
                             (call node ("op" "identity") [res1.$.result!] $prices)
                            )
                            (call node (mean_sid "mean") [$prices] result)
                           )
                           (call -relay- ("op" "noop") [])
                          )
                          (seq
                           (call -relay- ("op" "noop") [])
                           (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 1])
                          )
                         )
                        )
                       )
                      )
                      (xor
                       (call %init_peer_id% ("callbackSrv" "response") [result])
                       (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 2])
                      )
                     )
                     (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 3])
                    )
    `
    return callFunction(
        args,
        {
    "functionName" : "get_price",
    "returnType" : {
        "tag" : "primitive"
    },
    "argDefs" : [
        {
            "name" : "coin",
            "argType" : {
                "tag" : "primitive"
            }
        },
        {
            "name" : "currency",
            "argType" : {
                "tag" : "primitive"
            }
        },
        {
            "name" : "node",
            "argType" : {
                "tag" : "primitive"
            }
        },
        {
            "name" : "pg_sid",
            "argType" : {
                "tag" : "primitive"
            }
        },
        {
            "name" : "mean_sid",
            "argType" : {
                "tag" : "primitive"
            }
        }
    ],
    "names" : {
        "relay" : "-relay-",
        "getDataSrv" : "getDataSrv",
        "callbackSrv" : "callbackSrv",
        "responseSrv" : "callbackSrv",
        "responseFnName" : "response",
        "errorHandlingSrv" : "errorHandlingSrv",
        "errorFnName" : "error"
    }
},
        script
    )
}
