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

export interface SrvDef {
    add_alias: (alias: string, service_id: string, callParams: CallParams<'alias' | 'service_id'>) => void | Promise<void>;
create: (blueprint_id: string, callParams: CallParams<'blueprint_id'>) => string | Promise<string>;
get_interface: (service_id: string, callParams: CallParams<'service_id'>) => { function_signatures: { arguments: string[][]; name: string; output_types: string[]; }[]; record_types: { fields: string[][]; id: number; name: string; }[]; } | Promise<{ function_signatures: { arguments: string[][]; name: string; output_types: string[]; }[]; record_types: { fields: string[][]; id: number; name: string; }[]; }>;
list: (callParams: CallParams<null>) => { blueprint_id: string; id: string; owner_id: string; }[] | Promise<{ blueprint_id: string; id: string; owner_id: string; }[]>;
remove: (service_id: string, callParams: CallParams<'service_id'>) => void | Promise<void>;
resolve_alias: (alias: string, callParams: CallParams<'alias'>) => string | Promise<string>;
}
export function registerSrv(service: SrvDef): void;
export function registerSrv(serviceId: string, service: SrvDef): void;
export function registerSrv(peer: FluencePeer, service: SrvDef): void;
export function registerSrv(peer: FluencePeer, serviceId: string, service: SrvDef): void;
       

export function registerSrv(...args: any) {
    registerService(
        args,
        {
    "defaultServiceId" : "srv",
    "functions" : [
        {
            "functionName" : "add_alias",
            "argDefs" : [
                {
                    "name" : "alias",
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
            "returnType" : {
                "tag" : "void"
            }
        },
        {
            "functionName" : "create",
            "argDefs" : [
                {
                    "name" : "blueprint_id",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "get_interface",
            "argDefs" : [
                {
                    "name" : "service_id",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "list",
            "argDefs" : [
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "remove",
            "argDefs" : [
                {
                    "name" : "service_id",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "void"
            }
        },
        {
            "functionName" : "resolve_alias",
            "argDefs" : [
                {
                    "name" : "alias",
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
      


export interface PeerDef {
    connect: (id: string, multiaddrs: string[] | null, callParams: CallParams<'id' | 'multiaddrs'>) => boolean | Promise<boolean>;
get_contact: (peer: string, callParams: CallParams<'peer'>) => { addresses: string[]; peer_id: string; } | Promise<{ addresses: string[]; peer_id: string; }>;
identify: (callParams: CallParams<null>) => { external_addresses: string[]; } | Promise<{ external_addresses: string[]; }>;
is_connected: (peer: string, callParams: CallParams<'peer'>) => boolean | Promise<boolean>;
timestamp_ms: (callParams: CallParams<null>) => number | Promise<number>;
timestamp_sec: (callParams: CallParams<null>) => number | Promise<number>;
}
export function registerPeer(service: PeerDef): void;
export function registerPeer(serviceId: string, service: PeerDef): void;
export function registerPeer(peer: FluencePeer, service: PeerDef): void;
export function registerPeer(peer: FluencePeer, serviceId: string, service: PeerDef): void;
       

export function registerPeer(...args: any) {
    registerService(
        args,
        {
    "defaultServiceId" : "peer",
    "functions" : [
        {
            "functionName" : "connect",
            "argDefs" : [
                {
                    "name" : "id",
                    "argType" : {
                        "tag" : "primitive"
                    }
                },
                {
                    "name" : "multiaddrs",
                    "argType" : {
                        "tag" : "optional"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "get_contact",
            "argDefs" : [
                {
                    "name" : "peer",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "identify",
            "argDefs" : [
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "is_connected",
            "argDefs" : [
                {
                    "name" : "peer",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "timestamp_ms",
            "argDefs" : [
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "timestamp_sec",
            "argDefs" : [
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        }
    ]
}
    );
}
      


export interface OpDef {
    array: (a: string, b: string | null, c: string | null, d: string | null, callParams: CallParams<'a' | 'b' | 'c' | 'd'>) => string[] | Promise<string[]>;
array_length: (array: string[], callParams: CallParams<'array'>) => number | Promise<number>;
bytes_from_b58: (b: string, callParams: CallParams<'b'>) => number[] | Promise<number[]>;
bytes_to_b58: (bs: number[], callParams: CallParams<'bs'>) => string | Promise<string>;
concat: (a: string[], b: string[] | null, c: string[] | null, d: string[] | null, callParams: CallParams<'a' | 'b' | 'c' | 'd'>) => string[] | Promise<string[]>;
concat_strings: (a: string, b: string, callParams: CallParams<'a' | 'b'>) => string | Promise<string>;
identity: (s: string | null, callParams: CallParams<'s'>) => string | null | Promise<string | null>;
noop: (callParams: CallParams<null>) => void | Promise<void>;
sha256_string: (s: string, callParams: CallParams<'s'>) => string | Promise<string>;
string_from_b58: (b: string, callParams: CallParams<'b'>) => string | Promise<string>;
string_to_b58: (s: string, callParams: CallParams<'s'>) => string | Promise<string>;
}
export function registerOp(service: OpDef): void;
export function registerOp(serviceId: string, service: OpDef): void;
export function registerOp(peer: FluencePeer, service: OpDef): void;
export function registerOp(peer: FluencePeer, serviceId: string, service: OpDef): void;
       

export function registerOp(...args: any) {
    registerService(
        args,
        {
    "defaultServiceId" : "op",
    "functions" : [
        {
            "functionName" : "array",
            "argDefs" : [
                {
                    "name" : "a",
                    "argType" : {
                        "tag" : "primitive"
                    }
                },
                {
                    "name" : "b",
                    "argType" : {
                        "tag" : "optional"
                    }
                },
                {
                    "name" : "c",
                    "argType" : {
                        "tag" : "optional"
                    }
                },
                {
                    "name" : "d",
                    "argType" : {
                        "tag" : "optional"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "array_length",
            "argDefs" : [
                {
                    "name" : "array",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "bytes_from_b58",
            "argDefs" : [
                {
                    "name" : "b",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "bytes_to_b58",
            "argDefs" : [
                {
                    "name" : "bs",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "concat",
            "argDefs" : [
                {
                    "name" : "a",
                    "argType" : {
                        "tag" : "primitive"
                    }
                },
                {
                    "name" : "b",
                    "argType" : {
                        "tag" : "optional"
                    }
                },
                {
                    "name" : "c",
                    "argType" : {
                        "tag" : "optional"
                    }
                },
                {
                    "name" : "d",
                    "argType" : {
                        "tag" : "optional"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "concat_strings",
            "argDefs" : [
                {
                    "name" : "a",
                    "argType" : {
                        "tag" : "primitive"
                    }
                },
                {
                    "name" : "b",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "identity",
            "argDefs" : [
                {
                    "name" : "s",
                    "argType" : {
                        "tag" : "optional"
                    }
                }
            ],
            "returnType" : {
                "tag" : "optional"
            }
        },
        {
            "functionName" : "noop",
            "argDefs" : [
            ],
            "returnType" : {
                "tag" : "void"
            }
        },
        {
            "functionName" : "sha256_string",
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
        },
        {
            "functionName" : "string_from_b58",
            "argDefs" : [
                {
                    "name" : "b",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "string_to_b58",
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
      


export interface KademliaDef {
    merge: (target: string, left: string[], right: string[], count: number | null, callParams: CallParams<'target' | 'left' | 'right' | 'count'>) => string[] | Promise<string[]>;
neighborhood: (key: string, already_hashed: boolean | null, count: number | null, callParams: CallParams<'key' | 'already_hashed' | 'count'>) => string[] | Promise<string[]>;
}
export function registerKademlia(service: KademliaDef): void;
export function registerKademlia(serviceId: string, service: KademliaDef): void;
export function registerKademlia(peer: FluencePeer, service: KademliaDef): void;
export function registerKademlia(peer: FluencePeer, serviceId: string, service: KademliaDef): void;
       

export function registerKademlia(...args: any) {
    registerService(
        args,
        {
    "defaultServiceId" : "kad",
    "functions" : [
        {
            "functionName" : "merge",
            "argDefs" : [
                {
                    "name" : "target",
                    "argType" : {
                        "tag" : "primitive"
                    }
                },
                {
                    "name" : "left",
                    "argType" : {
                        "tag" : "primitive"
                    }
                },
                {
                    "name" : "right",
                    "argType" : {
                        "tag" : "primitive"
                    }
                },
                {
                    "name" : "count",
                    "argType" : {
                        "tag" : "optional"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "neighborhood",
            "argDefs" : [
                {
                    "name" : "key",
                    "argType" : {
                        "tag" : "primitive"
                    }
                },
                {
                    "name" : "already_hashed",
                    "argType" : {
                        "tag" : "optional"
                    }
                },
                {
                    "name" : "count",
                    "argType" : {
                        "tag" : "optional"
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
      


export interface ScriptDef {
    add: (air_script: string, interval: string | null, callParams: CallParams<'air_script' | 'interval'>) => string | Promise<string>;
list: (callParams: CallParams<null>) => { failures: number; id: string; interval: string; owner: string; src: string; } | Promise<{ failures: number; id: string; interval: string; owner: string; src: string; }>;
remove: (script_id: string, callParams: CallParams<'script_id'>) => boolean | Promise<boolean>;
}
export function registerScript(service: ScriptDef): void;
export function registerScript(serviceId: string, service: ScriptDef): void;
export function registerScript(peer: FluencePeer, service: ScriptDef): void;
export function registerScript(peer: FluencePeer, serviceId: string, service: ScriptDef): void;
       

export function registerScript(...args: any) {
    registerService(
        args,
        {
    "defaultServiceId" : "script",
    "functions" : [
        {
            "functionName" : "add",
            "argDefs" : [
                {
                    "name" : "air_script",
                    "argType" : {
                        "tag" : "primitive"
                    }
                },
                {
                    "name" : "interval",
                    "argType" : {
                        "tag" : "optional"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "list",
            "argDefs" : [
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "remove",
            "argDefs" : [
                {
                    "name" : "script_id",
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
      


export interface DistDef {
    add_blueprint: (blueprint: { dependencies: string[]; name: string; }, callParams: CallParams<'blueprint'>) => string | Promise<string>;
add_module: (wasm_b56_content: number[], conf: { name: string; }, callParams: CallParams<'wasm_b56_content' | 'conf'>) => string | Promise<string>;
add_module_from_vault: (path: string, config: { name: string; }, callParams: CallParams<'path' | 'config'>) => string | Promise<string>;
default_module_config: (module_name: string, callParams: CallParams<'module_name'>) => { name: string; } | Promise<{ name: string; }>;
get_interface: (module_id: string, callParams: CallParams<'module_id'>) => { function_signatures: { arguments: string[][]; name: string; output_types: string[]; }[]; record_types: { fields: string[][]; id: number; name: string; }[]; } | Promise<{ function_signatures: { arguments: string[][]; name: string; output_types: string[]; }[]; record_types: { fields: string[][]; id: number; name: string; }[]; }>;
list_blueprints: (callParams: CallParams<null>) => { dependencies: string[]; id: string; name: string; }[] | Promise<{ dependencies: string[]; id: string; name: string; }[]>;
list_modules: (callParams: CallParams<null>) => { config: { name: string; }; hash: string; name: string; }[] | Promise<{ config: { name: string; }; hash: string; name: string; }[]>;
make_blueprint: (name: string, dependencies: string[], callParams: CallParams<'name' | 'dependencies'>) => { dependencies: string[]; name: string; } | Promise<{ dependencies: string[]; name: string; }>;
make_module_config: (name: string, mem_pages_count: number | null, logger_enabled: boolean | null, preopened_files: string[] | null, envs: string[][] | null, mapped_dirs: string[][] | null, mounted_binaries: string[][] | null, logging_mask: number | null, callParams: CallParams<'name' | 'mem_pages_count' | 'logger_enabled' | 'preopened_files' | 'envs' | 'mapped_dirs' | 'mounted_binaries' | 'logging_mask'>) => { name: string; } | Promise<{ name: string; }>;
}
export function registerDist(service: DistDef): void;
export function registerDist(serviceId: string, service: DistDef): void;
export function registerDist(peer: FluencePeer, service: DistDef): void;
export function registerDist(peer: FluencePeer, serviceId: string, service: DistDef): void;
       

export function registerDist(...args: any) {
    registerService(
        args,
        {
    "defaultServiceId" : "dist",
    "functions" : [
        {
            "functionName" : "add_blueprint",
            "argDefs" : [
                {
                    "name" : "blueprint",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "add_module",
            "argDefs" : [
                {
                    "name" : "wasm_b56_content",
                    "argType" : {
                        "tag" : "primitive"
                    }
                },
                {
                    "name" : "conf",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "add_module_from_vault",
            "argDefs" : [
                {
                    "name" : "path",
                    "argType" : {
                        "tag" : "primitive"
                    }
                },
                {
                    "name" : "config",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "default_module_config",
            "argDefs" : [
                {
                    "name" : "module_name",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "get_interface",
            "argDefs" : [
                {
                    "name" : "module_id",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "list_blueprints",
            "argDefs" : [
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "list_modules",
            "argDefs" : [
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "make_blueprint",
            "argDefs" : [
                {
                    "name" : "name",
                    "argType" : {
                        "tag" : "primitive"
                    }
                },
                {
                    "name" : "dependencies",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "make_module_config",
            "argDefs" : [
                {
                    "name" : "name",
                    "argType" : {
                        "tag" : "primitive"
                    }
                },
                {
                    "name" : "mem_pages_count",
                    "argType" : {
                        "tag" : "optional"
                    }
                },
                {
                    "name" : "logger_enabled",
                    "argType" : {
                        "tag" : "optional"
                    }
                },
                {
                    "name" : "preopened_files",
                    "argType" : {
                        "tag" : "optional"
                    }
                },
                {
                    "name" : "envs",
                    "argType" : {
                        "tag" : "optional"
                    }
                },
                {
                    "name" : "mapped_dirs",
                    "argType" : {
                        "tag" : "optional"
                    }
                },
                {
                    "name" : "mounted_binaries",
                    "argType" : {
                        "tag" : "optional"
                    }
                },
                {
                    "name" : "logging_mask",
                    "argType" : {
                        "tag" : "optional"
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

