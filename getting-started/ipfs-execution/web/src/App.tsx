import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.scss";

import { createClient, FluenceClient } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { deploy_service, get_file_size, remove_service, globSource, provideFile, CID, urlSource } from "@fluencelabs/ipfs-execution";

const relayNodes = [krasnodar[0], krasnodar[1], krasnodar[2]];

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

function App() {
  const [client, setClient] = useState<FluenceClient | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);

  const [peerIdInput, setPeerIdInput] = useState<string>("");
  const [relayPeerIdInput, setRelayPeerIdInput] = useState<string>("");
  const [wasm, setWasm] = useState<typeof CID | null>(null);
  const [rpcAddr, setRpcAddr] = useState<string | null>("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileSize, setFileSize] = useState<number | null>(null);

  const isConnected = client !== null;
  const uploaded = wasm !== null;
  const deployed = serviceId !== null;

  const connect = (relayPeerId: string) => {
    createClient(relayPeerId)
      .then((client) => {
          setClient(client);
      })
      .catch((err) => console.log("Client initialization failed", err));
  };

  const uploadWasm = async () => {
    if (client === null) {
      return;
    }
    let {file, rpcAddr } = await provideFile(globSource("../service/artifacts/process_files.wasm"), client)
    setWasm(file);
    setRpcAddr(rpcAddr);
  };

  const deployService = async () => {
    if (client === null || wasm === null || rpcAddr === null) {
      return;
    }
    let service_id = await deploy_service(
        client, 
        client.relayPeerId!, wasm.cid.toString(), rpcAddr, 
        (msg, value) => console.log(msg, value),
        { ttl: 10000 }
    );
    setServiceId(service_id);
  };

  const getFileSize = async () => {
    if (client === null || serviceId === null) {
      return;
    }

    let {file, rpcAddr } = await provideFile(urlSource(fileUrl), client)    
    let size = await get_file_size(client, client.relayPeerId!, file.cid.toString(), rpcAddr, serviceId, { ttl: 10000 });
    setFileSize(size.size);
  };

  const removeService = async () => {
    if (client === null || serviceId === null) {
      return;
    }

    await remove_service(client, client.relayPeerId!, serviceId, { ttl: 10000 });
    setServiceId(null);
  };

    console.log(isConnected, uploaded, deployed);

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
                  <button className="btn" onClick={() => connect(x.multiaddr)}>
                    Connect
                  </button>
                </li>
              ))}
            </ul>
          </>
          </div>
          </div>
      );
    } else if (isConnected && !uploaded && !deployed) {
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
              <h2>Upload .wasm module!</h2>
              <p className="p">
                You will upload 'process_files.wasm' module to IPFS.
              </p>
              <div className="row">
                <button className="btn btn-hello" onClick={uploadWasm}>
                  upload .wasm
                </button>
              </div>
            </div>
          </>
          </div>
        </div>
      )
    } else if (uploaded && !deployed) {
      return (
        <div className="App">
          <header>
            <img src={logo} className="logo" alt="logo" />
          </header>

          <div className="content">
            <>
            <h1>Uploaded</h1>
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
                <td className="bold">CID:</td>
                <td className="mono">{wasm.cid.to_string()}</td>
              </tr>
              <tr>
                <td className="bold">Size:</td>
                <td className="mono">{wasm.size}</td>
              </tr>
            </table>
            <div>
              <h2>Upload .wasm module!</h2>
              <p className="p">
                You will upload 'process_files.wasm' module to IPFS.
              </p>
              <div className="row">
                <button className="btn btn-hello" onClick={uploadWasm}>
                  upload .wasm
                </button>
              </div>
            </div>
          </>
        </div>
        </div>
      );

      /*
      , then download it to the Fluence node,
                and dynamically create a service from it! 
                After that, you will be able to use that service to sizes of IPFS files!

              <div className="row">
                <label className="label bold">Peer id</label>
                <input
                  className="input"
                  type="text"
                  onChange={(e) => setPeerIdInput(e.target.value)}
                  value={peerIdInput}
                />
              </div>
              <div className="row">
                <label className="label bold">Relay</label>
                <input
                  className="input"
                  type="text"
                  onChange={(e) => setRelayPeerIdInput(e.target.value)}
                  value={relayPeerIdInput}
                />
              </div>
      */
    } else {
      return (
        <div className="App">
          <header>
            <img src={logo} className="logo" alt="logo" />
          </header>

          <div className="content">
          <>
            <h2>Unimplemented! isConnected {isConnected} uploaded {uploaded} deployed {deployed} wasm {wasm} </h2>
          </>
        </div>
        </div>
      )
    }
  }

export default App;
