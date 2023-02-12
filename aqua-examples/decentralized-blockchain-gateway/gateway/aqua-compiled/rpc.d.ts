/* eslint-disable */
// @ts-nocheck
/**
 *
 * This file is auto-generated. Do not edit manually: changes may be erased.
 * Generated by Aqua compiler: https://github.com/fluencelabs/aqua/.
 * If you find any bugs, please write an issue on GitHub: https://github.com/fluencelabs/aqua/issues
 * Aqua version: 0.9.3
 *
 */
import { FluencePeer } from '@fluencelabs/fluence';

import {
    callFunction$$,
    registerService$$,
} from '@fluencelabs/fluence/dist/internal/compilerSupport/v4.js';


// Services
export interface LoggerDef {
    log: (s: string[], callParams: CallParams$$<'s'>) => void | Promise<void>;
}
export function registerLogger(service: LoggerDef): void;
export function registerLogger(serviceId: string, service: LoggerDef): void;
export function registerLogger(peer: FluencePeer, service: LoggerDef): void;
export function registerLogger(peer: FluencePeer, serviceId: string, service: LoggerDef): void;
       
export interface EthCallerDef {
    eth_call: (uri: string, method: string, json_args: string[], callParams: CallParams$$<'uri' | 'method' | 'json_args'>) => { error: string; success: boolean; value: string; } | Promise<{ error: string; success: boolean; value: string; }>;
}
export function registerEthCaller(serviceId: string, service: EthCallerDef): void;
export function registerEthCaller(peer: FluencePeer, serviceId: string, service: EthCallerDef): void;
       

// Functions
 
export type CallResult = { error: string; success: boolean; value: string; }
export function call(
    uri: string,
    method: string,
    json_args: string[],
    serviceId: string,
    config?: {ttl?: number}
): Promise<CallResult>;

export function call(
    peer: FluencePeer,
    uri: string,
    method: string,
    json_args: string[],
    serviceId: string,
    config?: {ttl?: number}
): Promise<CallResult>;


/* eslint-enable */