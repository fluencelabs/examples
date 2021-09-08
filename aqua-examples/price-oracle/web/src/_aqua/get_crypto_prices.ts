/**
 *
 * This file is auto-generated. Do not edit manually: changes may be erased.
 * Generated by Aqua compiler: https://github.com/fluencelabs/aqua/. 
 * If you find any bugs, please write an issue on GitHub: https://github.com/fluencelabs/aqua/issues
 * Aqua version: 0.2.2-221
 *
 */
import { FluenceClient, PeerIdB58 } from '@fluencelabs/fluence';
import { RequestFlowBuilder } from '@fluencelabs/fluence/dist/api.unstable';
import { RequestFlow } from '@fluencelabs/fluence/dist/internal/RequestFlow';


// Services

//PriceGetterService
//defaultId = undefined

//price_getter: (coin: string, currency: string, timestamp_ms: number) => {error_msg:string;result:number;success:boolean}
//END PriceGetterService




//MeanService
//defaultId = undefined

//mean: (data: number[]) => {error_msg:string;result:number;success:boolean}
//END MeanService




//F64Op
//defaultId = "op"

//identity: (x: number) => number
//END F64Op



// Functions

export async function get_price(client: FluenceClient, coin: string, currency: string, node: string, pg_sid: string, mean_sid: string, config?: {ttl?: number}): Promise<{error_msg:string;result:number;success:boolean}> {
    let request: RequestFlow;
    const promise = new Promise<{error_msg:string;result:number;success:boolean}>((resolve, reject) => {
        const r = new RequestFlowBuilder()
            .disableInjections()
            .withRawScript(
                `
(xor
 (seq
  (seq
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
     (call -relay- ("op" "noop") [])
    )
    (xor
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
     (seq
      (call -relay- ("op" "noop") [])
      (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 1])
     )
    )
   )
   (call -relay- ("op" "noop") [])
  )
  (xor
   (call %init_peer_id% ("callbackSrv" "response") [result])
   (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 2])
  )
 )
 (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 3])
)

            `,
            )
            .configHandler((h) => {
                h.on('getDataSrv', '-relay-', () => {
                    return client.relayPeerId!;
                });
                h.on('getDataSrv', 'coin', () => {return coin;});
h.on('getDataSrv', 'currency', () => {return currency;});
h.on('getDataSrv', 'node', () => {return node;});
h.on('getDataSrv', 'pg_sid', () => {return pg_sid;});
h.on('getDataSrv', 'mean_sid', () => {return mean_sid;});
                h.onEvent('callbackSrv', 'response', (args) => {
    const [res] = args;
  resolve(res);
});

                h.onEvent('errorHandlingSrv', 'error', (args) => {
                    // assuming error is the single argument
                    const [err] = args;
                    reject(err);
                });
            })
            .handleScriptError(reject)
            .handleTimeout(() => {
                reject('Request timed out for get_price');
            })
        if(config && config.ttl) {
            r.withTTL(config.ttl)
        }
        request = r.build();
    });
    await client.initiateFlow(request!);
    return promise;
}
      


export async function get_price_par(client: FluenceClient, coin: string, currency: string, getter_topo: {node:string;service_id:string}[], mean_topo: {node:string;service_id:string}, config?: {ttl?: number}): Promise<{error_msg:string;result:number;success:boolean}> {
    let request: RequestFlow;
    const promise = new Promise<{error_msg:string;result:number;success:boolean}>((resolve, reject) => {
        const r = new RequestFlowBuilder()
            .disableInjections()
            .withRawScript(
                `
(xor
 (seq
  (seq
   (seq
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
         (call %init_peer_id% ("getDataSrv" "getter_topo") [] getter_topo)
        )
        (call %init_peer_id% ("getDataSrv" "mean_topo") [] mean_topo)
       )
       (fold getter_topo topo
        (par
         (seq
          (seq
           (seq
            (call -relay- ("op" "noop") [])
            (xor
             (seq
              (seq
               (seq
                (call topo.$.node! ("op" "string_to_b58") [topo.$.node!] k)
                (call topo.$.node! ("peer" "timestamp_ms") [] ts_ms)
               )
               (call topo.$.node! (topo.$.service_id! "price_getter") [coin currency ts_ms] res)
              )
              (call topo.$.node! ("op" "identity") [res.$.result!] $prices)
             )
             (seq
              (call -relay- ("op" "noop") [])
              (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 1])
             )
            )
           )
           (call -relay- ("op" "noop") [])
          )
          (call %init_peer_id% ("op" "noop") [])
         )
         (next topo)
        )
       )
      )
      (call %init_peer_id% ("op" "identity") [$prices.$.[2]!])
     )
     (call -relay- ("op" "noop") [])
    )
    (xor
     (seq
      (call -relay- ("op" "noop") [])
      (call mean_topo.$.node! (mean_topo.$.service_id! "mean") [$prices] result)
     )
     (seq
      (call -relay- ("op" "noop") [])
      (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 2])
     )
    )
   )
   (call -relay- ("op" "noop") [])
  )
  (xor
   (call %init_peer_id% ("callbackSrv" "response") [result])
   (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 3])
  )
 )
 (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 4])
)

            `,
            )
            .configHandler((h) => {
                h.on('getDataSrv', '-relay-', () => {
                    return client.relayPeerId!;
                });
                h.on('getDataSrv', 'coin', () => {return coin;});
h.on('getDataSrv', 'currency', () => {return currency;});
h.on('getDataSrv', 'getter_topo', () => {return getter_topo;});
h.on('getDataSrv', 'mean_topo', () => {return mean_topo;});
                h.onEvent('callbackSrv', 'response', (args) => {
    const [res] = args;
  resolve(res);
});

                h.onEvent('errorHandlingSrv', 'error', (args) => {
                    // assuming error is the single argument
                    const [err] = args;
                    reject(err);
                });
            })
            .handleScriptError(reject)
            .handleTimeout(() => {
                reject('Request timed out for get_price_par');
            })
        if(config && config.ttl) {
            r.withTTL(config.ttl)
        }
        request = r.build();
    });
    await client.initiateFlow(request!);
    return promise;
}
      
