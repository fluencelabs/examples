import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.scss";

import { createClient, FluenceClient } from "@fluencelabs/fluence";
import { get_external_api_multiaddr } from "@fluencelabs/aqua-ipfs";
import { stage } from "@fluencelabs/fluence-network-environment";
import { deploy_service, get_file_size, remove_service, provideFile } from "@fluencelabs/ipfs-execution";
const { create, globSource, urlSource, CID } = require('ipfs-http-client');

const relayNodes = [stage[0], stage[1], stage[2]];

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

function App() {
  const [client, setClient] = useState<FluenceClient | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);

  const [peerIdInput, setPeerIdInput] = useState<string>("");
  const [relayPeerIdInput, setRelayPeerIdInput] = useState<string>("");
  const [wasm, setWasm] = useState<string | null>(null);
  const [rpcAddr, setRpcAddr] = useState<string | null>("");
  const [fileCID, setFileCID] = useState<string>("");
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
    // let {file, rpcAddr } = await provideFile(globSource("../service/artifacts/process_files.wasm"), client)
    // let { file, rpcAddr } = await provideFile(urlSource("https://transfer.sh/13jim4O/process_files.wasm"), client);
    let result = await get_external_api_multiaddr(client, client.relayPeerId!);
    let rpcAddr = result.multiaddr;
    console.dir(rpcAddr);

    setWasm("QmVg9EnanAbwTuEqjjuc1R2uf3AdtEkrNagSifQMkHfyNU");
    setRpcAddr(rpcAddr);
    // QmVg9EnanAbwTuEqjjuc1R2uf3AdtEkrNagSifQMkHfyNU
  };

  const deployService = async () => {
    if (client === null || wasm === null || rpcAddr === null) {
      return;
    }
    let service_id = await deploy_service(
        client, 
        client.relayPeerId!, wasm, rpcAddr, 
        (msg, value) => console.log(msg, value),
        { ttl: 10000 }
    );
    setServiceId(service_id);
  };

  const getFileSize = async () => {
    if (client === null || serviceId === null || rpcAddr === null) {
      return;
    }

    let size = await get_file_size(client, client.relayPeerId!, fileCID, rpcAddr, serviceId, { ttl: 10000 });
    setFileSize(size.size);
  };

  const removeService = async () => {
    if (client === null || serviceId === null) {
      return;
    }

    await remove_service(client, client.relayPeerId!, serviceId, { ttl: 10000 });
    setServiceId(null);
  };

    console.log("isConnected, uploaded, deployed\n", isConnected, uploaded, deployed);

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
      console.log("uploaded!", wasm);
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
                <td className="bold">process_files.wasm CID:</td>
                <td className="mono">{wasm}</td>
              </tr>
            </table>
            <div>
              <h2>Deploy ProcessFiles service</h2>
              <p className="p">
                process_files.wasm will be downloaded to the Fluence node,
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
      );
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
              <h2>Get file size</h2>
              <p className="p">
                <a href="https://anarkrypto.github.io/upload-files-to-ipfs-from-browser-panel/public/">Upload any file to IPFS</a>
                , paste CID and get the size of that file via ProcessFiles service you have just deployed
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
              <div className="row">
                <label className="label bold">File Size:</label>
                <label className="mono"> {fileSize}</label>
              </div>
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
            <h2>Unimplemented! isConnected {isConnected} uploaded {uploaded} deployed {deployed} wasm {wasm} </h2>
          </>
        </div>
        </div>
      )
    }
  }

export default App;
