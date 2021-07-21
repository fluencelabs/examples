import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.scss";

import { createClient, FluenceClient } from "@fluencelabs/fluence";
import { get_external_api_multiaddr } from "@fluencelabs/aqua-ipfs";
import { stage } from "@fluencelabs/fluence-network-environment";
import { deploy_service, put_file_size, remove_service, provideFile } from "@fluencelabs/ipfs-execution";
import { Multiaddr, protocols } from 'multiaddr';
const { create, globSource, urlSource, CID } = require('ipfs-http-client');

const relayNodes = [stage[0], stage[1], stage[2]];

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

function fromOption<T>(opt: T | T[] | null): T | null {
    if (Array.isArray(opt)) {
        if (opt.length === 0) { return null; }
        
        opt = opt[0];
    }
    if (opt === null) { return null; }
    
    return opt;
}

function decapsulateP2P(rpcAddr: string): string {
  return new Multiaddr(rpcAddr).decapsulateCode(protocols.names.p2p.code).toString();
}

function App() {
  const [client, setClient] = useState<FluenceClient | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);

  const [wasm, setWasm] = useState<string | null>("Qmf8fH2cDZXGKS9uDGBcHxv5uQ51ChrigdZKe3QxS2C1AF");
  const [rpcAddr, setRpcAddr] = useState<string | null>("");
  const [fileCID, setFileCID] = useState<string>("");
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [fileSizeCID, setFileSizeCID] = useState<string | null>(null);

  const isConnected = client !== null;
  const gotRpcAddr = rpcAddr !== null;
  const deployed = serviceId !== null;

  const connect = async (relayPeerId: string) => {
    try {
      let client = await createClient(relayPeerId);
      setClient(client);
      await getRpcAddr(client);
    } catch (err) {
      console.log("Client initialization failed", err);
    }
  };

  const getRpcAddr = async (client: FluenceClient) => {
    if (client === null) {
      console.log("getRpcAddr client is null");
      return;
    }

    let result = await get_external_api_multiaddr(client, client.relayPeerId!);
    console.log("getRpcAddr result", result);
    let rpcAddr = result.multiaddr;
    setRpcAddr(decapsulateP2P(rpcAddr));
  }

  const deployService = async () => {
    console.log("wasm %s rpcAddr %s", wasm, rpcAddr);
    if (client === null || wasm === null || rpcAddr === null) {
      return;
    }
    var service_id = await deploy_service(
        client, 
        client.relayPeerId!, wasm, rpcAddr, 
        (msg, value) => console.log(msg, value),
        { ttl: 10000 }
    );
    service_id = fromOption(service_id);
    setServiceId(service_id);
  };

  const getFileSize = async () => {
    if (client === null || serviceId === null || rpcAddr === null) {
      return;
    }

    var putResult = await put_file_size(
      client, 
      client.relayPeerId!, fileCID, rpcAddr, serviceId, 
      size => setFileSize(size.toString()),
      (label, error) => setFileSize("Error: " + label + ": " + error),
      { ttl: 10000 }
    );
    putResult = fromOption(putResult);
    if (putResult === null) {
      return;
    }
    if (putResult.success) {
      setFileSizeCID(putResult.hash);
    } else {
      setFileSizeCID("Error: " + putResult.error);
    }
  };

  const removeService = async () => {
    if (client === null || serviceId === null) {
      return;
    }

    await remove_service(client, client.relayPeerId!, serviceId, { ttl: 10000 });
    setServiceId(null);
  };

    console.log("isConnected gotRpcAddr deployed\n", isConnected, gotRpcAddr, deployed);

    if (!isConnected) {
      return (<div className="App">
          <header>
            <img src={logo} className="logo" alt="logo" />
          </header>

          <div className="content">
          <>
            <h1>Pick a relay</h1>
            <ul>
              {relayNodes.map((x) => (
                <li key={x.peerId}>
                  <span className="mono">{x.peerId}</span>
                  <button className="btn" onClick={async () => await connect(x.multiaddr)}>
                    Connect
                  </button>
                </li>
              ))}
            </ul>
          </>
          </div>
          </div>
      );
    } else if (isConnected && gotRpcAddr && !deployed) {
      return (
        <div className="App">
          <header>
            <img src={logo} className="logo" alt="logo" />
          </header>

          <div className="content">
          <>
            <h1>Connected</h1>
            <table>
              <tr>
                <td className="bold">Peer id:</td>
                <td className="mono">{client!.selfPeerId}</td>
                <td>
                  <button
                    className="btn-clipboard"
                    onClick={() => copyToClipboard(client!.selfPeerId)}
                  >
                    <i className="gg-clipboard"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td className="bold">Relay peer id:</td>
                <td className="mono">{client!.relayPeerId}</td>
                <td>
                  <button
                    className="btn-clipboard"
                    onClick={() => copyToClipboard(client!.relayPeerId!)}
                  >
                    <i className="gg-clipboard"></i>
                  </button>
                </td>
              </tr>
            </table>
            <div>
              <div className="row">
                <h2>Set IPFS RPC address:</h2>
                <p className="p">
                  Specify IPFS to download process_files.wasm from
                </p>
                <input
                  className="input"
                  type="text"
                  onChange={(e) => setRpcAddr(e.target.value)}
                  value={rpcAddr!}
                />
              </div>
              <div className="row">
                <h2>Set process_files.wasm module CID</h2>
                <p className="p">
                  To deploy a service, specify CID of WebAssembly module.
                </p>
                <input
                  className="input"
                  type="text"
                  onChange={(e) => setWasm(e.target.value)}
                  value={wasm!}
                />
              </div>
            </div>
            <div>
              <h2>Deploy ProcessFiles service</h2>
              <p className="p">
                process_files.wasm will be downloaded via IPFS to the Fluence node,
                and then a service will be dynamically created from it! 
                
                After that, you will be able to use that service to get sizes of IPFS files!
              </p>
              <div className="row">
                <button className="btn btn-hello" onClick={deployService}>
                  deploy service
                </button>
              </div>
            </div>
          </>
          </div>
        </div>
      )
    } else if (deployed) {
      return (
        <div className="App">
          <header>
            <img src={logo} className="logo" alt="logo" />
          </header>

          <div className="content">
          <>
            <h1>Deployed</h1>
            <table>
              <tr>
                <td className="bold">Peer id:</td>
                <td className="mono">{client!.selfPeerId}</td>
                <td>
                  <button
                    className="btn-clipboard"
                    onClick={() => copyToClipboard(client!.selfPeerId)}
                  >
                    <i className="gg-clipboard"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td className="bold">Relay peer id:</td>
                <td className="mono">{client!.relayPeerId}</td>
                <td>
                  <button
                    className="btn-clipboard"
                    onClick={() => copyToClipboard(client!.relayPeerId!)}
                  >
                    <i className="gg-clipboard"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td className="bold">process_files.wasm CID:</td>
                <td className="mono">{wasm}</td>
                <td>
                  <button
                    className="btn-clipboard"
                    onClick={() => copyToClipboard(wasm!)}
                  >
                    <i className="gg-clipboard"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td className="bold">ProcessFiles service ID:</td>
                <td className="mono">{serviceId}</td>
                <button
                    className="btn-clipboard"
                    onClick={() => removeService()}
                >
                  <i className="gg-trash"></i>
                </button>
              </tr>
              <tr>
                <td className="bold">File Size:</td>
                <td className="mono">{fileSize}</td>
              </tr>
            </table>
            <div>
              <div className="row">
                <h2>Set IPFS RPC address:</h2>
                <p className="p">
                  Specify IPFS to download file from
                </p>
                <input
                  className="input"
                  type="text"
                  onChange={(e) => setRpcAddr(e.target.value)}
                  value={rpcAddr!}
                />
              </div>
              <h2>Get file size</h2>
              <p className="p">
                Upload any file to IPFS node 
                <p><b>{ rpcAddr }</b></p>
                paste CID here and get the size of that file via ProcessFiles service you have just deployed
              </p>
              <div className="row">
                <label className="label bold">IPFS CID</label>
                <input
                  className="input"
                  type="text"
                  onChange={(e) => setFileCID(e.target.value)}
                  value={fileCID}
                />
              </div>
              <div className="row">
                <button className="btn btn-hello" onClick={getFileSize} >
                  get size
                </button>
              </div>
            </div>
            <div className="row">
              <label className="label bold">File Size:</label>
              <label className="mono">{fileSize}</label>
            </div>
            <div className="row">
              <label className="label bold">File size is uploaded to IPFS as CID:</label>
              <label className="mono">{fileSizeCID}</label>
            </div>
          </>
        </div>
        </div>
      )
    } else {
      return (
        <div className="App">
          <header>
            <img src={logo} className="logo" alt="logo" />
          </header>

          <div className="content">
          <>
            <h2>Unimplemented! isConnected {isConnected} deployed {deployed} wasm {wasm} </h2>
          </>
        </div>
        </div>
      )
    }
  }

export default App;
