import { Fluence, KeyPair as FluenceKeyPair } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { NearSignerApiDef, registerNearSignerApi } from "./_aqua/near_signing_node";
import * as fs from 'fs';
import * as path from 'path';
import { Buffer } from 'buffer';
import * as nearAPI from "near-api-js";
import { AccountState } from './interfaces';


const { connect, keyStores, KeyPair, WalletConnection, Account } = nearAPI;


const MY_LAME_PASSWORD = "lame_password";

// temp fix replace with your key, e.g., account pk
const SeedArray = new Uint8Array([10, 10, 20, 20, 100, 100, 10, 10, 20, 20, 100, 100, 10, 10, 10, 10, 10, 10, 20, 20, 100, 100, 10, 10, 20, 20, 100, 100, 10, 10, 10, 10]);


class NearSigner implements NearSignerApiDef {

    _homedir = require("os").homedir();
    _CREDENTIALS_DIR = ".near-credentials";
    _credentialsPath = path.join(this._homedir, this._CREDENTIALS_DIR);
    _keyStore = new keyStores.UnencryptedFileSystemKeyStore(this._credentialsPath);

    password_checker(password: string): boolean {
        return (password === MY_LAME_PASSWORD)
    }

    async send_money(network_id: string, account_id: string, receiver_id: string, amount: string, password: string): Promise<any> {
        if (!this.password_checker(password)) {
            return Promise.resolve("Not Authorized")
        }
        const config = get_config(network_id, this._keyStore);
        const near = await network_connect(config);
        let account = await near.account(account_id);
        let tx_receipt = await account.sendMoney(receiver_id, amount);
        let result = Promise.resolve(tx_receipt);
        return result;
    }

    async account_state(network_id: string, account_id: string, password: string): Promise<any> {
        if (!this.password_checker(password)) {
            return Promise.resolve("Not Authorized")
        }

        const config = get_config(network_id, this._keyStore);
        const near = await network_connect(config);
        const account = await near.account(account_id);
        const response = await account.state();

        return Promise.resolve(response);
    }

    async get_balance(network_id: string, account_id: string, password: string): Promise<any> {
        if (!this.password_checker(password)) {
            return Promise.resolve("Not Authorized")
        }

        const config = get_config(network_id, this._keyStore);
        const near = await network_connect(config);
        const account = await near.account(account_id);
        const balance = await account.getAccountBalance();
        return Promise.resolve(balance);
    }

    /*
    async sign_tx(network_id: string, from: string, to: string): Promise<any> {
        // const config = get_config("testnet", this._keyStore);
        const near = await network_connect(config);

        let status = await near.connection.provider.status();
        const blockHash = status.sync_info.latest_block_hash;

        const raw_tx = nearAPI.transactions.createTransaction(
            from,
            pk,
            to,
            nonce_pk,
            actions,
            blockHash
        );

        const bytes = raw_tx.encode();

    }

    async verify_signature(network_id: string, keyStore: nearAPI.keyStores.UnencryptedFileSystemKeyStore, account_id: string, payload: string, signature: Uint8Array) {
        const keyPair = await keyStore.getKey(network_id, account_id);
        const msg = Buffer.from(payload);

    }
    */
}


function get_config(networkId: string, keyStore: nearAPI.keyStores.UnencryptedFileSystemKeyStore): any {
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

async function network_connect(config: any): Promise<nearAPI.Near> {
    const near = await connect(config);
    return Promise.resolve(near);
}


async function main() {

    await Fluence.start({
        connectTo: krasnodar[5],
        /*
        connectTo: {
            multiaddr: "/ip4/127.0.0.1/tcp/9990/ws/p2p/12D3KooWHBG9oaVx4i3vi6c1rSBUm7MLBmyGmmbHoZ23pmjDCnvK",
            peerId: "12D3KooWHBG9oaVx4i3vi6c1rSBUm7MLBmyGmmbHoZ23pmjDCnvK"
        },
        */
        KeyPair: await FluenceKeyPair.fromEd25519SK(SeedArray)
    });

    const peerId = Fluence.getStatus().peerId;
    const relayPeerId = Fluence.getStatus().relayPeerId;
    console.log("PeerId: ", peerId);
    console.log("Relay id: ", relayPeerId);

    registerNearSignerApi("near", new NearSigner());

    const jsonServices = JSON.stringify(
        {
          name: "JsService",
          serviceId: "JsService",
          functions: [
            {
              name: "get",
              result: {
                peerId,
                relayPeerId
              },
            },
          ],
        },
        null,
        2
      )
    // console.log("js-service.json: ", jsonServices)
    var fs = require('fs');
    fs.writeFileSync("js-services.json", jsonServices, function(err: any) {
        console.log("Error occured while writing the JSON Object to the file.");
        return console.log(err);
    }
    );
    console.log("ctrl-c to exit");

    // await Fluence.stop();
}

main();
