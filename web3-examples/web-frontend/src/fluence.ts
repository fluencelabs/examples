import { FluenceClient, Particle, sendParticleAsFetch } from '@fluencelabs/fluence';
import { testNet, dev } from '@fluencelabs/fluence-network-environment';

const timeout = 20000;

export const relayNode = dev[2];

const node = dev[2].peerId;

const serviceId = '8067ab18-1a95-4cd9-b477-a33e3549012f';
const bluePrintId = 'uuid-dc0b258-65f0-11eb-bf24-acde48001122';

export const getInterface = async (client: FluenceClient) => {
    const script = `
    (seq
        (call myRelay ("op" "identity") [])
        (seq
            (call node ("srv" "get_interfaces") [arg] result)
            (seq
                (call myRelay ("op" "identity") [])
                (call myPeerId ("_callback" "getInterface") [result])
            )
        )
    )
    `;

    const data = {
        node: node,
        // arg: { blueprint_id: bluePrintId, service_id: serviceId },
        arg: serviceId,
        myRelay: client.relayPeerId,
        myPeerId: client.selfPeerId,
    };
    return sendParticleAsFetch(client, new Particle(script, data, 999999), 'getInterface');
};

type Method =
    | 'eth_get_balance'
    | 'test_eth_get_balance_bad'
    | 'test_filters'
    | 'test_drop_outliers_and_average'
    | 'test_eth_get_balance_good'
    | 'test_simple_average'
    | 'test_pending_with_null_filter'
    | 'new_pending_tx_filter'
    | 'eth_hash_method_id'
    | 'test_eth_hash_method_id'
    | 'sum_data'
    | 'drop_outliers_and_average'
    | 'uninstall_filter'
    | 'eth_get_tx_by_hash'
    | 'simple_average'
    | 'test_eth_get_tx_by_hash'
    | 'eth_get_block_height'
    | 'get_filter_changes'
    | 'get_filter_changes_without_null';

const callEthService = async <T>(client: FluenceClient, method: Method, args: any[], ttl: number) => {
    const argsNames = args.map((val, index) => `arg${index}`).join(' ');

    const script = `
    (seq
        (call myRelay ("op" "identity") [])
        (seq
            (call node (serviceId fnName) [${argsNames}] result)
            (seq
                (call myRelay ("op" "identity") [])
                (call myPeerId ("_callback" "${method}") [result])
            )
        )
    )
    `;

    const data = new Map();
    data.set('node', node);
    data.set('serviceId', serviceId);
    data.set('fnName', method);
    data.set('myRelay', client.relayPeerId);
    data.set('myPeerId', client.selfPeerId);
    for (let i = 0; i < args.length; i++) {
        data.set('arg' + i, args[i]);
    }

    return await sendParticleAsFetch<T>(client, new Particle(script, data, ttl), method);
};

export const createFilter = async (client: FluenceClient, url: string): Promise<string> => {
    const [res] = await callEthService<[string]>(client, 'new_pending_tx_filter', [url], timeout);
    return res;
};

export const getFilterChanges = async (
    client: FluenceClient,
    url: string,
    filterId: string,
): Promise<Array<string>> => {
    const [res] = await callEthService<[string]>(client, 'get_filter_changes', [url, filterId], timeout);
    return JSON.parse(res).result;
};

export const getFilterChangesWithoutNulls = async (
    client: FluenceClient,
    url: string,
    filterId: string,
    n: string,
): Promise<Array<TxInfo>> => {
    const [res] = await callEthService<[any]>(client, 'get_filter_changes_without_null', [url, filterId, n], timeout);
    return res;
};

export const removeFilter = async (client: FluenceClient, url: string, filterId: string): Promise<boolean> => {
    const [res] = await callEthService<[number]>(client, 'uninstall_filter', [url, filterId], timeout);
    return res === 1 ? true : false;
};

export interface TxInfo {
    /**
     * DATA, 32 Bytes - hash of the block where this transaction was in. null when its pending.
     */
    blockHash: any;
    /**
     * QUANTITY - block number where this transaction was in. null when its pending.
     */
    blockNumber: any;
    /**
     * DATA, 20 Bytes - address of the sender.
     */
    from: any;
    /**
     * QUANTITY - gas provided by the sender.
     */
    gas: any;
    /**
     * QUANTITY - gas price provided by the sender in Wei.
     */
    gasPrice: any;
    /**
     * DATA, 32 Bytes - hash of the transaction.
     */
    hash: any;
    /**
     * DATA - the data send along with the transaction.
     */
    input: any;
    /**
     * QUANTITY - the number of transactions made by the sender prior to this one.
     */
    nonce: any;
    /**
     * DATA, 20 Bytes - address of the receiver. null when its a contract creation transaction.
     */
    to: any;
    /**
     * QUANTITY - integer of the transactions index position in the block. null when its pending.
     */
    transactionIndex: any;
    /**
     * QUANTITY - value transferred in Wei.
     */
    value: any;
    /**
     * QUANTITY - ECDSA recovery id
     */
    v: any;
    /**
     * DATA, 32 Bytes - ECDSA signature r
     */
    r: any;
    /**
     * DATA, 32 Bytes - ECDSA signature s
     */
    s: any;
}

export const getTxInfo = async (client: FluenceClient, url: string, tx: string): Promise<TxInfo> => {
    const [raw] = await callEthService<[string]>(client, 'eth_get_tx_by_hash', [url, tx], timeout);
    const res = JSON.parse(raw);
    return res.result;
};
