import { Fluence, KeyPair as FluenceKeyPair } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { sign_transaction, NearWalletApiDef, registerNearWalletApi } from "./_aqua/near_wallet";
import * as nearAPI from "near-api-js";
import { KeyStore } from "near-api-js/lib/key_stores";
import * as fs from 'fs';
import { Buffer } from 'buffer';
import { Near } from "near-api-js";

const { connect, keyStores, KeyPair, WalletConnection, Account } = nearAPI;
const KEY_PATH = "~./near-credentials/testnet/boneyard93501.testnet.json";
const keyStore = new keyStores.UnencryptedFileSystemKeyStore(KEY_PATH);

// temp fix replace with your key, e.g., account pk
const SeedArray = new Uint8Array([10, 10, 20, 20, 100, 100]);
class NearWalletApi implements NearWalletApiDef {

    async sign_transaction(network_id: string, tx_string: string, password: string): Promise<string> {
        const config = get_config(network_id);
        const near = await network_connect(config);
        const wallet = await wallet_connect(near, "signer-node");
        await wallet_signout(wallet);

        return Promise.resolve("boo yah");
    }

    async account_state(network_id: string, account_id: string): Promise<any> {
        const config = get_config(network_id);
        const near = await network_connect(config);
        console.log("calling acct state");
        console.log("config: ", config);
        const state = await account_state(near, account_id);
        console.log("account state: ", state);

        return Promise.resolve(state);
    }

    async send_tokens(network_id: string, account_id: string, receiver_id: string, amount: string): Promise<any> {
        const config = get_config(network_id);
        const near = await network_connect(config);
        const result = await send_tokens(near, account_id, receiver_id, amount);

        return Promise.resolve(result);
    }

    // async from_
    // async to_
}

function get_config(networkId: string): any {
    const config = {
        networkId,
        keyStore,
        nodeUrl: `https://rpc.${networkId}.near.org`,
        // nodeUrl: `https://rpc.testnet.near.org`,
        walletUrl: `https://wallet.${networkId}.near.org`,
        helperUrl: `https://helper.${networkId}.near.org`,
        explorerUrl: `https://explorer.${networkId}.near.org`,
    };

    return config;
}

async function network_connect(network_id: string): Promise<nearAPI.Near> {
    const config = get_config(network_id);
    const near = await connect(config);
    // console.log("near: ", near);
    return Promise.resolve(near);
}

async function wallet_signout(wallet: nearAPI.WalletConnection): Promise<boolean> {
    if (wallet.isSignedIn()) {
        wallet.signOut();
    }
    return Promise.resolve(wallet.isSignedIn());
}

async function wallet_connect(near: nearAPI.Near, app_name: string): Promise<nearAPI.WalletConnection> {
    // create wallet connection
    const wallet = new WalletConnection(near, app_name);
    return Promise.resolve(wallet);
}

async function wallet_load(network_id: string, account_id: string) {
    const config = get_config(network_id);
    const near = await connect(config);
    const account = await near.account(account_id);
}


async function sign(network_id: string, payload: string, account_id: string): Promise<Uint8Array> {
    const keyPair = await keyStore.getKey(network_id, account_id);
    const msg = Buffer.from(payload);
    const { signature } = keyPair.sign(msg);
    return Promise.resolve(signature);
}

async function verify_signature(network_id: string, account_id: string, payload: string, signature: Uint8Array) {
    const keyPair = await keyStore.getKey(network_id, account_id);
    const msg = Buffer.from(payload);

}


// account
async function get_balance(near: nearAPI.Near, account_id: string): Promise<any> {
    const account = await near.account(account_id);
    const balance = await account.getAccountBalance();
    return Promise.resolve(balance);
}


// deploy
async function deploy_contract_local(near: nearAPI.Near, account_id: string, wasm_path: string): Promise<nearAPI.providers.FinalExecutionOutcome> {

    const account = await near.account(account_id);
    const deployment = account.deployContract(fs.readFileSync(wasm_path));
    return Promise.resolve(deployment);
}

async function deploy_contract(near: nearAPI.Near, account_id: string, wasm_raw: Uint8Array): Promise<nearAPI.providers.FinalExecutionOutcome> {

    const account = await near.account(account_id);
    const deployment = account.deployContract(wasm_raw);
    return Promise.resolve(deployment);
}


async function deploy_contract_from_string(near: nearAPI.Near, account_id: string, wasm_str: string): Promise<nearAPI.providers.FinalExecutionOutcome> {

    const account = await near.account(account_id);
    const buffer = Buffer.from(wasm_str, 'utf8');
    const deployment = account.deployContract(buffer);
    return Promise.resolve(deployment);
}


async function send_tokens(near: nearAPI.Near, account_id: string, receiver_id: string, amount: string): Promise<nearAPI.providers.FinalExecutionOutcome> {
    const account = await near.account(account_id);
    const result = await account.sendMoney(receiver_id, amount);
    return Promise.resolve(result);
}


// state
async function account_state(near: nearAPI.Near, account_id: string): Promise<any> {
    const account = await near.account(account_id);
    const response = await account.state();
    return Promise.resolve(response);
}

interface AccountState {
    amount: string,
    block_hash: string,
    block_height: number,
    code_hash: string,
    locked: string,
    storage_paid_at: number,
    storage_usage: number
}

async function main() {

    const config = get_config("testnet");
    const near = await connect(config);
    // const acct_state = await account_state(near, "boneyard93501.testnet");
    // console.log("account state: ", acct_state);


    await Fluence.start({
        connectTo: krasnodar[5],
        KeyPair: await FluenceKeyPair.fromEd25519SK(SeedArray)
    });

    console.log("PeerId: ", Fluence.getStatus().peerId);
    console.log("Relay id: ", Fluence.getStatus().relayPeerId);

    registerNearWalletApi("NearWalletApi", new NearWalletApi);


    console.log("crtl-c to exit");


}

main();
