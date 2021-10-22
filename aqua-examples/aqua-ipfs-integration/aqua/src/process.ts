/**
 *
 * This file is auto-generated. Do not edit manually: changes may be erased.
 * Generated by Aqua compiler: https://github.com/fluencelabs/aqua/.
 * If you find any bugs, please write an issue on GitHub: https://github.com/fluencelabs/aqua/issues
 * Aqua version: 0.4.0-235
 *
 */
import { Fluence, FluencePeer } from '@fluencelabs/fluence';
import {
    CallParams,
    callFunction,
    registerService,
} from '@fluencelabs/fluence/dist/internal/compilerSupport/v2';


// Services

export interface StringOpDef {
    array: (s: string, callParams: CallParams<'s'>) => string[] | Promise<string[]>;
}
export function registerStringOp(service: StringOpDef): void;
export function registerStringOp(serviceId: string, service: StringOpDef): void;
export function registerStringOp(peer: FluencePeer, service: StringOpDef): void;
export function registerStringOp(peer: FluencePeer, serviceId: string, service: StringOpDef): void;
       

export function registerStringOp(...args: any) {
    registerService(
        args,
        {
    "defaultServiceId" : "op",
    "functions" : [
        {
            "functionName" : "array",
            "argDefs" : [
                {
                    "name" : "s",
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
 

export function add_blueprint(module_hash: string, config?: {ttl?: number}): Promise<string>;
export function add_blueprint(peer: FluencePeer, module_hash: string, config?: {ttl?: number}): Promise<string>;
export function add_blueprint(...args: any) {

    let script = `
                        (xor
                     (seq
                      (seq
                       (seq
                        (seq
                         (seq
                          (seq
                           (call %init_peer_id% ("getDataSrv" "-relay-") [] -relay-)
                           (call %init_peer_id% ("getDataSrv" "module_hash") [] module_hash)
                          )
                          (call %init_peer_id% ("op" "concat_strings") ["hash:" module_hash] prefixed_hash)
                         )
                         (call %init_peer_id% ("op" "array") [prefixed_hash] dependencies)
                        )
                        (call %init_peer_id% ("dist" "make_blueprint") ["process_files" dependencies] blueprint)
                       )
                       (call %init_peer_id% ("dist" "add_blueprint") [blueprint] blueprint_id)
                      )
                      (xor
                       (call %init_peer_id% ("callbackSrv" "response") [blueprint_id])
                       (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 1])
                      )
                     )
                     (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 2])
                    )
    `
    return callFunction(
        args,
        {
    "functionName" : "add_blueprint",
    "returnType" : {
        "tag" : "primitive"
    },
    "argDefs" : [
        {
            "name" : "module_hash",
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

 

export function put_file_size(relay: string, cid: string, ipfs: string, service_id: string, logSize: (arg0: number, callParams: CallParams<'arg0'>) => void | Promise<void>, error: (arg0: string, arg1: string, callParams: CallParams<'arg0' | 'arg1'>) => void | Promise<void>, config?: {ttl?: number}): Promise<{ error: string; hash: string; success: boolean; } | null>;
export function put_file_size(peer: FluencePeer, relay: string, cid: string, ipfs: string, service_id: string, logSize: (arg0: number, callParams: CallParams<'arg0'>) => void | Promise<void>, error: (arg0: string, arg1: string, callParams: CallParams<'arg0' | 'arg1'>) => void | Promise<void>, config?: {ttl?: number}): Promise<{ error: string; hash: string; success: boolean; } | null>;
export function put_file_size(...args: any) {

    let script = `
                        (xor
                     (seq
                      (seq
                       (seq
                        (seq
                         (seq
                          (seq
                           (seq
                            (seq
                             (call %init_peer_id% ("getDataSrv" "-relay-") [] -relay-)
                             (call %init_peer_id% ("getDataSrv" "relay") [] relay)
                            )
                            (call %init_peer_id% ("getDataSrv" "cid") [] cid)
                           )
                           (call %init_peer_id% ("getDataSrv" "ipfs") [] ipfs)
                          )
                          (call %init_peer_id% ("getDataSrv" "service_id") [] service_id)
                         )
                         (call -relay- ("op" "noop") [])
                        )
                        (xor
                         (seq
                          (call relay ("aqua-ipfs" "get_from") [cid ipfs] get)
                          (xor
                           (match get.$.success! true
                            (xor
                             (seq
                              (call relay (service_id "file_size") [get.$.path!] size)
                              (xor
                               (match size.$.success! true
                                (xor
                                 (seq
                                  (seq
                                   (par
                                    (seq
                                     (call -relay- ("op" "noop") [])
                                     (xor
                                      (call %init_peer_id% ("callbackSrv" "logSize") [size.$.size!])
                                      (seq
                                       (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 1])
                                       (call -relay- ("op" "noop") [])
                                      )
                                     )
                                    )
                                    (null)
                                   )
                                   (call relay (service_id "write_file_size") [size.$.size!] write)
                                  )
                                  (xor
                                   (match write.$.success! true
                                    (xor
                                     (call relay ("aqua-ipfs" "put") [write.$.path!] $result)
                                     (seq
                                      (call -relay- ("op" "noop") [])
                                      (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 2])
                                     )
                                    )
                                   )
                                   (par
                                    (seq
                                     (call -relay- ("op" "noop") [])
                                     (xor
                                      (call %init_peer_id% ("callbackSrv" "error") ["ProcessFiles.write_file_size failed" write.$.error!])
                                      (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 3])
                                     )
                                    )
                                    (null)
                                   )
                                  )
                                 )
                                 (seq
                                  (call -relay- ("op" "noop") [])
                                  (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 4])
                                 )
                                )
                               )
                               (par
                                (seq
                                 (call -relay- ("op" "noop") [])
                                 (xor
                                  (call %init_peer_id% ("callbackSrv" "error") ["ProcessFiles.file_size failed" size.$.error!])
                                  (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 5])
                                 )
                                )
                                (null)
                               )
                              )
                             )
                             (seq
                              (call -relay- ("op" "noop") [])
                              (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 6])
                             )
                            )
                           )
                           (par
                            (seq
                             (call -relay- ("op" "noop") [])
                             (xor
                              (call %init_peer_id% ("callbackSrv" "error") ["Ipfs.get_from failed" get.$.error!])
                              (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 7])
                             )
                            )
                            (null)
                           )
                          )
                         )
                         (seq
                          (call -relay- ("op" "noop") [])
                          (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 8])
                         )
                        )
                       )
                       (call -relay- ("op" "noop") [])
                      )
                      (xor
                       (call %init_peer_id% ("callbackSrv" "response") [$result])
                       (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 9])
                      )
                     )
                     (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 10])
                    )
    `
    return callFunction(
        args,
        {
    "functionName" : "put_file_size",
    "returnType" : {
        "tag" : "optional"
    },
    "argDefs" : [
        {
            "name" : "relay",
            "argType" : {
                "tag" : "primitive"
            }
        },
        {
            "name" : "cid",
            "argType" : {
                "tag" : "primitive"
            }
        },
        {
            "name" : "ipfs",
            "argType" : {
                "tag" : "primitive"
            }
        },
        {
            "name" : "service_id",
            "argType" : {
                "tag" : "primitive"
            }
        },
        {
            "name" : "logSize",
            "argType" : {
                "tag" : "callback",
                "callback" : {
                    "argDefs" : [
                        {
                            "name" : "arg0",
                            "argType" : {
                                "tag" : "primitive"
                            }
                        }
                    ],
                    "returnType" : {
                        "tag" : "void"
                    }
                }
            }
        },
        {
            "name" : "error",
            "argType" : {
                "tag" : "callback",
                "callback" : {
                    "argDefs" : [
                        {
                            "name" : "arg0",
                            "argType" : {
                                "tag" : "primitive"
                            }
                        },
                        {
                            "name" : "arg1",
                            "argType" : {
                                "tag" : "primitive"
                            }
                        }
                    ],
                    "returnType" : {
                        "tag" : "void"
                    }
                }
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

 

export function remove_service(relay: string, service_id: string, config?: {ttl?: number}): Promise<boolean>;
export function remove_service(peer: FluencePeer, relay: string, service_id: string, config?: {ttl?: number}): Promise<boolean>;
export function remove_service(...args: any) {

    let script = `
                        (xor
                     (seq
                      (seq
                       (seq
                        (seq
                         (seq
                          (seq
                           (call %init_peer_id% ("getDataSrv" "-relay-") [] -relay-)
                           (call %init_peer_id% ("getDataSrv" "relay") [] relay)
                          )
                          (call %init_peer_id% ("getDataSrv" "service_id") [] service_id)
                         )
                         (call -relay- ("op" "noop") [])
                        )
                        (xor
                         (call relay ("srv" "remove") [service_id])
                         (seq
                          (call -relay- ("op" "noop") [])
                          (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 1])
                         )
                        )
                       )
                       (call -relay- ("op" "noop") [])
                      )
                      (xor
                       (call %init_peer_id% ("callbackSrv" "response") [true])
                       (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 2])
                      )
                     )
                     (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 3])
                    )
    `
    return callFunction(
        args,
        {
    "functionName" : "remove_service",
    "returnType" : {
        "tag" : "primitive"
    },
    "argDefs" : [
        {
            "name" : "relay",
            "argType" : {
                "tag" : "primitive"
            }
        },
        {
            "name" : "service_id",
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

 

export function add_module(name: string, path: string, config?: {ttl?: number}): Promise<string>;
export function add_module(peer: FluencePeer, name: string, path: string, config?: {ttl?: number}): Promise<string>;
export function add_module(...args: any) {

    let script = `
                        (xor
                     (seq
                      (seq
                       (seq
                        (seq
                         (seq
                          (call %init_peer_id% ("getDataSrv" "-relay-") [] -relay-)
                          (call %init_peer_id% ("getDataSrv" "name") [] name)
                         )
                         (call %init_peer_id% ("getDataSrv" "path") [] path)
                        )
                        (call %init_peer_id% ("dist" "default_module_config") [name] config)
                       )
                       (call %init_peer_id% ("dist" "add_module_from_vault") [path config] module_hash)
                      )
                      (xor
                       (call %init_peer_id% ("callbackSrv" "response") [module_hash])
                       (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 1])
                      )
                     )
                     (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 2])
                    )
    `
    return callFunction(
        args,
        {
    "functionName" : "add_module",
    "returnType" : {
        "tag" : "primitive"
    },
    "argDefs" : [
        {
            "name" : "name",
            "argType" : {
                "tag" : "primitive"
            }
        },
        {
            "name" : "path",
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

 

export function deploy_service(relay: string, cid: string, ipfs: string, error: (arg0: string, arg1: string, callParams: CallParams<'arg0' | 'arg1'>) => void | Promise<void>, config?: {ttl?: number}): Promise<string | null>;
export function deploy_service(peer: FluencePeer, relay: string, cid: string, ipfs: string, error: (arg0: string, arg1: string, callParams: CallParams<'arg0' | 'arg1'>) => void | Promise<void>, config?: {ttl?: number}): Promise<string | null>;
export function deploy_service(...args: any) {

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
                            (call %init_peer_id% ("getDataSrv" "relay") [] relay)
                           )
                           (call %init_peer_id% ("getDataSrv" "cid") [] cid)
                          )
                          (call %init_peer_id% ("getDataSrv" "ipfs") [] ipfs)
                         )
                         (call -relay- ("op" "noop") [])
                        )
                        (xor
                         (seq
                          (call relay ("aqua-ipfs" "get_from") [cid ipfs] get_result)
                          (xor
                           (match get_result.$.success! true
                            (xor
                             (seq
                              (seq
                               (seq
                                (seq
                                 (seq
                                  (seq
                                   (call relay ("dist" "default_module_config") ["process_files"] config)
                                   (call relay ("dist" "add_module_from_vault") [get_result.$.path! config] module_hash)
                                  )
                                  (call relay ("op" "concat_strings") ["hash:" module_hash] prefixed_hash)
                                 )
                                 (call relay ("op" "array") [prefixed_hash] dependencies)
                                )
                                (call relay ("dist" "make_blueprint") ["process_files" dependencies] blueprint)
                               )
                               (call relay ("dist" "add_blueprint") [blueprint] blueprint_id)
                              )
                              (call relay ("srv" "create") [blueprint_id] $service_id)
                             )
                             (seq
                              (call -relay- ("op" "noop") [])
                              (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 1])
                             )
                            )
                           )
                           (par
                            (seq
                             (call -relay- ("op" "noop") [])
                             (xor
                              (call %init_peer_id% ("callbackSrv" "error") ["Ipfs.get_from failed" get_result.$.error!])
                              (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 2])
                             )
                            )
                            (null)
                           )
                          )
                         )
                         (seq
                          (call -relay- ("op" "noop") [])
                          (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 3])
                         )
                        )
                       )
                       (call -relay- ("op" "noop") [])
                      )
                      (xor
                       (call %init_peer_id% ("callbackSrv" "response") [$service_id])
                       (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 4])
                      )
                     )
                     (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 5])
                    )
    `
    return callFunction(
        args,
        {
    "functionName" : "deploy_service",
    "returnType" : {
        "tag" : "optional"
    },
    "argDefs" : [
        {
            "name" : "relay",
            "argType" : {
                "tag" : "primitive"
            }
        },
        {
            "name" : "cid",
            "argType" : {
                "tag" : "primitive"
            }
        },
        {
            "name" : "ipfs",
            "argType" : {
                "tag" : "primitive"
            }
        },
        {
            "name" : "error",
            "argType" : {
                "tag" : "callback",
                "callback" : {
                    "argDefs" : [
                        {
                            "name" : "arg0",
                            "argType" : {
                                "tag" : "primitive"
                            }
                        },
                        {
                            "name" : "arg1",
                            "argType" : {
                                "tag" : "primitive"
                            }
                        }
                    ],
                    "returnType" : {
                        "tag" : "void"
                    }
                }
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
