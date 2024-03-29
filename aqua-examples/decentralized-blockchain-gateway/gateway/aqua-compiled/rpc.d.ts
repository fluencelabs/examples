/* eslint-disable */
// @ts-nocheck
/**
 *
 * This file is auto-generated. Do not edit manually: changes may be erased.
 * Generated by Aqua compiler: https://github.com/fluencelabs/aqua/.
 * If you find any bugs, please write an issue on GitHub: https://github.com/fluencelabs/aqua/issues
 * Aqua version: 0.10.1
 *
 */

import {
    v5_callFunction as callFunction$$,
    v5_registerService as registerService$$,
} from '@fluencelabs/js-client.api';
    


// Services
export interface NumOpDef {
    identity: (n: number, callParams: CallParams$$<'n'>) => number | Promise<number>;
}
export function registerNumOp(service: NumOpDef): void;
export function registerNumOp(serviceId: string, service: NumOpDef): void;
export function registerNumOp(peer: IFluenceClient$$, service: NumOpDef): void;
export function registerNumOp(peer: IFluenceClient$$, serviceId: string, service: NumOpDef): void;
       
export interface LoggerDef {
    log: (s: string[], callParams: CallParams$$<'s'>) => void | Promise<void>;
    logCall: (s: string, callParams: CallParams$$<'s'>) => void | Promise<void>;
}
export function registerLogger(service: LoggerDef): void;
export function registerLogger(serviceId: string, service: LoggerDef): void;
export function registerLogger(peer: IFluenceClient$$, service: LoggerDef): void;
export function registerLogger(peer: IFluenceClient$$, serviceId: string, service: LoggerDef): void;
       
export interface QuorumCheckerDef {
    check: (results: { error: string; success: boolean; value: string; }[], minResults: number, callParams: CallParams$$<'results' | 'minResults'>) => { error: string; results: { error: string; success: boolean; value: string; }[]; value: string; } | Promise<{ error: string; results: { error: string; success: boolean; value: string; }[]; value: string; }>;
}
export function registerQuorumChecker(service: QuorumCheckerDef): void;
export function registerQuorumChecker(serviceId: string, service: QuorumCheckerDef): void;
export function registerQuorumChecker(peer: IFluenceClient$$, service: QuorumCheckerDef): void;
export function registerQuorumChecker(peer: IFluenceClient$$, serviceId: string, service: QuorumCheckerDef): void;
       
export interface EthCallerDef {
    eth_call: (uri: string, method: string, jsonArgs: string[], callParams: CallParams$$<'uri' | 'method' | 'jsonArgs'>) => { error: string; success: boolean; value: string; } | Promise<{ error: string; success: boolean; value: string; }>;
}
export function registerEthCaller(serviceId: string, service: EthCallerDef): void;
export function registerEthCaller(peer: IFluenceClient$$, serviceId: string, service: EthCallerDef): void;
       
export interface CounterDef {
    incrementAndReturn: (callParams: CallParams$$<null>) => number | Promise<number>;
}
export function registerCounter(service: CounterDef): void;
export function registerCounter(serviceId: string, service: CounterDef): void;
export function registerCounter(peer: IFluenceClient$$, service: CounterDef): void;
export function registerCounter(peer: IFluenceClient$$, serviceId: string, service: CounterDef): void;
       

// Functions
 
export type RoundRobinEthResult = { error: string; success: boolean; value: string; }
export function roundRobinEth(
    uris: string[],
    method: string,
    jsonArgs: string[],
    serviceId: string,
    counterServiceId: string,
    counterPeerId: string,
    config?: {ttl?: number}
): Promise<RoundRobinEthResult>;

export function roundRobinEth(
    peer: IFluenceClient$$,
    uris: string[],
    method: string,
    jsonArgs: string[],
    serviceId: string,
    counterServiceId: string,
    counterPeerId: string,
    config?: {ttl?: number}
): Promise<RoundRobinEthResult>;

 
export type EmptyResult = { error: string; success: boolean; value: string; }
export function empty(
    config?: {ttl?: number}
): Promise<EmptyResult>;

export function empty(
    peer: IFluenceClient$$,
    config?: {ttl?: number}
): Promise<EmptyResult>;

 
export type QuorumEthResult = { error: string; results: { error: string; success: boolean; value: string; }[]; value: string; }
export function quorumEth(
    uris: string[],
    quorumNumber: number,
    timeout: number,
    method: string,
    jsonArgs: string[],
    serviceId: string,
    quorumServiceId: string,
    quorumPeerId: string,
    config?: {ttl?: number}
): Promise<QuorumEthResult>;

export function quorumEth(
    peer: IFluenceClient$$,
    uris: string[],
    quorumNumber: number,
    timeout: number,
    method: string,
    jsonArgs: string[],
    serviceId: string,
    quorumServiceId: string,
    quorumPeerId: string,
    config?: {ttl?: number}
): Promise<QuorumEthResult>;

 
export type RandomLoadBalancingResult = { error: string; success: boolean; value: string; }
export function randomLoadBalancing(
    uris: string[],
    method: string,
    jsonArgs: string[],
    serviceId: string,
    callFunc: (arg0: string, arg1: string, arg2: string[], arg3: string, callParams: CallParams$$<'arg0' | 'arg1' | 'arg2' | 'arg3'>) => { error: string; success: boolean; value: string; } | Promise<{ error: string; success: boolean; value: string; }>,
    config?: {ttl?: number}
): Promise<RandomLoadBalancingResult>;

export function randomLoadBalancing(
    peer: IFluenceClient$$,
    uris: string[],
    method: string,
    jsonArgs: string[],
    serviceId: string,
    callFunc: (arg0: string, arg1: string, arg2: string[], arg3: string, callParams: CallParams$$<'arg0' | 'arg1' | 'arg2' | 'arg3'>) => { error: string; success: boolean; value: string; } | Promise<{ error: string; success: boolean; value: string; }>,
    config?: {ttl?: number}
): Promise<RandomLoadBalancingResult>;

 
export type RandomLoadBalancingEthResult = { error: string; success: boolean; value: string; }
export function randomLoadBalancingEth(
    uris: string[],
    method: string,
    jsonArgs: string[],
    serviceId: string,
    config?: {ttl?: number}
): Promise<RandomLoadBalancingEthResult>;

export function randomLoadBalancingEth(
    peer: IFluenceClient$$,
    uris: string[],
    method: string,
    jsonArgs: string[],
    serviceId: string,
    config?: {ttl?: number}
): Promise<RandomLoadBalancingEthResult>;

 
export type QuorumResult = { error: string; results: { error: string; success: boolean; value: string; }[]; value: string; }
export function quorum(
    uris: string[],
    quorumNumber: number,
    timeout: number,
    method: string,
    jsonArgs: string[],
    serviceId: string,
    quorumServiceId: string,
    quorumPeerId: string,
    callFunc: (arg0: string, arg1: string, arg2: string[], arg3: string, callParams: CallParams$$<'arg0' | 'arg1' | 'arg2' | 'arg3'>) => { error: string; success: boolean; value: string; } | Promise<{ error: string; success: boolean; value: string; }>,
    config?: {ttl?: number}
): Promise<QuorumResult>;

export function quorum(
    peer: IFluenceClient$$,
    uris: string[],
    quorumNumber: number,
    timeout: number,
    method: string,
    jsonArgs: string[],
    serviceId: string,
    quorumServiceId: string,
    quorumPeerId: string,
    callFunc: (arg0: string, arg1: string, arg2: string[], arg3: string, callParams: CallParams$$<'arg0' | 'arg1' | 'arg2' | 'arg3'>) => { error: string; success: boolean; value: string; } | Promise<{ error: string; success: boolean; value: string; }>,
    config?: {ttl?: number}
): Promise<QuorumResult>;

 
export type RoundRobinResult = { error: string; success: boolean; value: string; }
export function roundRobin(
    uris: string[],
    method: string,
    jsonArgs: string[],
    serviceId: string,
    counterServiceId: string,
    counterPeerId: string,
    callFunc: (arg0: string, arg1: string, arg2: string[], arg3: string, callParams: CallParams$$<'arg0' | 'arg1' | 'arg2' | 'arg3'>) => { error: string; success: boolean; value: string; } | Promise<{ error: string; success: boolean; value: string; }>,
    config?: {ttl?: number}
): Promise<RoundRobinResult>;

export function roundRobin(
    peer: IFluenceClient$$,
    uris: string[],
    method: string,
    jsonArgs: string[],
    serviceId: string,
    counterServiceId: string,
    counterPeerId: string,
    callFunc: (arg0: string, arg1: string, arg2: string[], arg3: string, callParams: CallParams$$<'arg0' | 'arg1' | 'arg2' | 'arg3'>) => { error: string; success: boolean; value: string; } | Promise<{ error: string; success: boolean; value: string; }>,
    config?: {ttl?: number}
): Promise<RoundRobinResult>;

 
export type CallResult = { error: string; success: boolean; value: string; }
export function call(
    uri: string,
    method: string,
    jsonArgs: string[],
    serviceId: string,
    config?: {ttl?: number}
): Promise<CallResult>;

export function call(
    peer: IFluenceClient$$,
    uri: string,
    method: string,
    jsonArgs: string[],
    serviceId: string,
    config?: {ttl?: number}
): Promise<CallResult>;


/* eslint-enable */