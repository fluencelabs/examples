import { Fluence, KeyPair as FluenceKeyPair } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { sign_transaction, NearWalletApiDef, registerNearWalletApi } from "./_aqua/near_wallet";
import * as nearAPI from "near-api-js";
import { KeyStore } from "near-api-js/lib/key_stores";
import * as fs from 'fs';
import { Buffer } from 'buffer';

const { connect, keyStores, KeyPair, WalletConnection, Account } = nearAPI;
const KEY_PATH = "~./near-credentials/testnet/boneyard93501.testnet.json";
const keyStore = new keyStores.UnencryptedFileSystemKeyStore(KEY_PATH);

const SeedArray = new Uint8Array([10, 10, 20, 20, 100, 100]);

enum NearNetwork {
    mainnet = 0, // "https://rpc.mainnet.near.org",   // near cli: mainnet selection is 'production'
    testnet,       // near cli: development or testnet
    betanet,
    localnet,      // bear-cli: local
}

// var NearUrl = `https://rpc.{}.near.org`;
// var WalletUrl = `https://wallet.{}.near.org`;
// var HelperUrl = `https://helper.{}.near.org`;
// var ExplorerUrl = `https://explorer.{}.near.org`;




class NearWalletApi implements NearWalletApiDef {

    async sign_transaction(network_id: string, tx_string: string, password: string): Promise<string> {
        const config = get_config(network_id);
        const near = await network_connect(config);
        const wallet = await wallet_connect(near, "signer-node");
        console.log("wallet: ", wallet);
        await wallet_signout(wallet);

        return Promise.resolve("boo yah");
    }
}

function get_config(networkId: string): any {
    const config = {
        networkId,
        keyStore,
        nodeUrl: `https://rpc.${networkId}.near.org`,
        walletUrl: `https://wallet.${networkId}.near.org`,
        helperUrl: `https://helper.${networkId}.near.org`,
        explorerUrl: `https://explorer.${networkId}.near.org`,
    };

    return config;
}

async function network_connect(network_id: string): Promise<nearAPI.Near> {
    const config = get_config(network_id);
    const near = await connect(config);
    console.log("near: ", near);
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


// state
async function account_state(near: nearAPI.Near, account_id: string): Promise<any> {
    const account = await near.account(account_id);
    const response = await account.state();
    return Promise.resolve(response);
}


async function main() {
    /*
    await Fluence.start({
        connectTo: krasnodar[5],
        KeyPair: await FluenceKeyPair.fromEd25519SK(SeedArray)
    });

    console.log("PeerId: ", Fluence.getStatus().peerId);
    console.log("Relay id: ", Fluence.getStatus().relayPeerId);

    registerNearWalletApi("NearWalletApi", new NearWalletApi);


    console.log("crtl-c to exit");
    */
    const config = get_config("testnet");
    console.log("config: ", config);
    const near = await connect(config);
    console.log("near: ", near);
    const acct_state = await account_state(near, "boneyard93501.testnet");
    console.log("account state: ", acct_state);

}

main();
