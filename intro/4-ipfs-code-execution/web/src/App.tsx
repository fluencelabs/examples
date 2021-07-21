import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.scss";

import { createClient, FluenceClient } from "@fluencelabs/fluence";
import { get_external_api_multiaddr } from "@fluencelabs/aqua-ipfs";
import { stage } from "@fluencelabs/fluence-network-environment";
import {
  deploy_service,
  put_file_size,
  remove_service,
  provideFile,
} from "@fluencelabs/ipfs-execution";
import { Multiaddr, protocols } from "multiaddr";
const { create, globSource, urlSource, CID } = require("ipfs-http-client");

const relayNodes = [stage[0], stage[1], stage[2]];

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

function fromOption<T>(opt: T | T[] | null): T | null {
  if (Array.isArray(opt)) {
    if (opt.length === 0) {
      return null;
    }

    opt = opt[0];
  }
  if (opt === null) {
    return null;
  }

  return opt;
}

function decapsulateP2P(rpcAddr: string): string {
  return new Multiaddr(rpcAddr)
    .decapsulateCode(protocols.names.p2p.code)
    .toString();
}

function App() {
  const [client, setClient] = useState<FluenceClient | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);

  const [wasm, setWasm] = useState<string>(
    "Qmf8fH2cDZXGKS9uDGBcHxv5uQ51ChrigdZKe3QxS2C1AF"
  );
  const [rpcAddr, setRpcAddr] = useState<string>("");
  const [fileCID, setFileCID] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [fileSizeCID, setFileSizeCID] = useState<string>("");

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
  };

  const deployService = async () => {
    console.log("wasm %s rpcAddr %s", wasm, rpcAddr);
    if (client === null || wasm === null || rpcAddr === null) {
      return;
    }
    var service_id = await deploy_service(
      client,
      client.relayPeerId!,
      wasm,
      rpcAddr,
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
      client.relayPeerId!,
      fileCID,
      rpcAddr,
      serviceId,
      (size) => setFileSize(size.toString()),
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

    await remove_service(client, client.relayPeerId!, serviceId, {
      ttl: 10000,
    });
    setServiceId(null);
  };

  console.log(
    "isConnected gotRpcAddr deployed\n",
    isConnected,
    gotRpcAddr,
    deployed
  );

  return (
    <div className="App">
      <header>
        <img src={logo} className="logo" alt="logo" />
      </header>

      <div className="content">
        {!isConnected && <ConnectionForm connect={connect} />}
        {isConnected && <Connected client={client!} />}
        {isConnected && gotRpcAddr && !deployed && (
          <IpfsForm
            rpcAddr={rpcAddr}
            setRpcAddr={setRpcAddr}
            wasm={wasm}
            setWasm={setWasm}
            deployService={deployService}
          />
        )}
        {deployed && (
          <Deployed
            setRpcAddr={setRpcAddr}
            rpcAddr={rpcAddr}
            setFileCID={setFileCID}
            fileCID={fileCID}
            fileSize={fileSize}
            fileSizeCID={fileSizeCID}
            getFileSize={getFileSize}
            wasm={wasm}
            serviceId={serviceId}
            removeService={removeService}
          />
        )}
      </div>
    </div>
  );
}

const Deployed = (props: {
  setRpcAddr: React.Dispatch<React.SetStateAction<string>>;
  rpcAddr: string;
  setFileCID: React.Dispatch<React.SetStateAction<string>>;
  fileCID: string;
  fileSize: string;
  fileSizeCID: string;
  getFileSize: () => Promise<void>;
  wasm: string;
  serviceId: string | null;
  removeService: () => {};
}) => {
  return (
    <>
      <h2>Deployed</h2>
      <table>
        <tr>
          <td className="bold">process_files.wasm CID:</td>
          <td className="mono">{props.wasm}</td>
          <td>
            <button
              className="btn-clipboard"
              onClick={() => copyToClipboard(props.wasm)}
            >
              <i className="gg-clipboard"></i>
            </button>
          </td>
        </tr>
        <tr>
          <td className="bold">ProcessFiles service ID:</td>
          <td className="mono">{props.serviceId}</td>
          <button
            className="btn-clipboard"
            onClick={() => props.removeService()}
          >
            <i className="gg-trash"></i>
          </button>
        </tr>
        <tr>
          <td className="bold">File Size:</td>
          <td className="mono">{props.fileSize}</td>
        </tr>
      </table>
      <div>
        <div className="row">
          <h2>Set IPFS RPC address:</h2>
          <p className="p">Specify IPFS to download file from</p>
          <input
            className="input"
            type="text"
            onChange={(e) => props.setRpcAddr(e.target.value)}
            value={props.rpcAddr}
          />
        </div>
        <h2>Get file size</h2>
        <p className="p">
          Upload any file to IPFS node
          <p>
            <b>{props.rpcAddr}</b>
          </p>
          paste CID here and get the size of that file via ProcessFiles service
          you have just deployed
        </p>
        <div className="row">
          <label className="label bold">IPFS CID</label>
          <input
            className="input"
            type="text"
            onChange={(e) => props.setFileCID(e.target.value)}
            value={props.fileCID}
          />
        </div>
        <div className="row">
          <button className="btn btn-hello" onClick={props.getFileSize}>
            get size
          </button>
        </div>
      </div>
      <div className="row">
        <label className="label bold">File Size:</label>
        <label className="mono">{props.fileSize}</label>
      </div>
      <div className="row">
        <label className="label bold">
          File size is uploaded to IPFS as CID:
        </label>
        <label className="mono">{props.fileSizeCID}</label>
      </div>
    </>
  );
};

const IpfsForm = (props: {
  rpcAddr: string;
  setRpcAddr: React.Dispatch<React.SetStateAction<string>>;
  wasm: string;
  setWasm: React.Dispatch<React.SetStateAction<string>>;
  deployService: () => Promise<void>;
}) => {
  return (
    <>
      <div>
        <div className="row">
          <h2>Set IPFS RPC address:</h2>
          <p className="p">Specify IPFS to download process_files.wasm from</p>
          <input
            className="input"
            type="text"
            onChange={(e) => props.setRpcAddr(e.target.value)}
            value={props.rpcAddr}
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
            onChange={(e) => props.setWasm(e.target.value)}
            value={props.wasm}
          />
        </div>
      </div>
      <div>
        <h2>Deploy ProcessFiles service</h2>
        <p className="p">
          process_files.wasm will be downloaded via IPFS to the Fluence node,
          and then a service will be dynamically created from it! After that,
          you will be able to use that service to get sizes of IPFS files!
        </p>
        <div className="row">
          <button className="btn btn-hello" onClick={props.deployService}>
            deploy service
          </button>
        </div>
      </div>
    </>
  );
};

const ConnectionForm = (props: {
  connect: (multiaddr: string) => Promise<void>;
}) => {
  return (
    <>
      <h1>Pick a relay</h1>
      <ul>
        {relayNodes.map((x) => (
          <li key={x.peerId}>
            <span className="mono">{x.peerId}</span>
            <button
              className="btn"
              onClick={async () => await props.connect(x.multiaddr)}
            >
              Connect
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

const Connected = (props: { client: FluenceClient }) => {
  return (
    <>
      <h1>Connected</h1>
      <table>
        <tr>
          <td className="bold">Peer id:</td>
          <td className="mono">{props.client.selfPeerId}</td>
          <td>
            <button
              className="btn-clipboard"
              onClick={() => copyToClipboard(props.client.selfPeerId)}
            >
              <i className="gg-clipboard"></i>
            </button>
          </td>
        </tr>
        <tr>
          <td className="bold">Relay peer id:</td>
          <td className="mono">{props.client.relayPeerId}</td>
          <td>
            <button
              className="btn-clipboard"
              onClick={() => copyToClipboard(props.client.relayPeerId!)}
            >
              <i className="gg-clipboard"></i>
            </button>
          </td>
        </tr>
      </table>
    </>
  );
};

export default App;
