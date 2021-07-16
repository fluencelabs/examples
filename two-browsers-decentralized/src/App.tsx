import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.scss";

import { createClient, FluenceClient } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { sayHello } from "./_aqua/getting-started";

const relayNodes = [krasnodar[0], krasnodar[1], krasnodar[2]];

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

function App() {
  const [client, setClient] = useState<FluenceClient | null>(null);
  const [helloFrom, setHelloFrom] = useState<string | null>(null);

  const [peerIdInput, setPeerIdInput] = useState<string>("");
  const [relayPeerIdInput, setRelayPeerIdInput] = useState<string>("");

  const isConnected = client !== null;

  const connect = (relayPeerId: string) => {
    createClient(relayPeerId)
      .then((client) => {
        // Register handler for this call in aqua:
        // HelloWorld.recieveHello(%init_peer_id%)
        client.callServiceHandler.onEvent(
          "HelloWorld",
          "recieveHello",
          (args) => {
            const [msg] = args;
            setHelloFrom(msg);
          }
        );
        setClient(client);
      })
      .catch((err) => console.log("Client initialization failed", err));
  };

  const doSayHello = async () => {
    if (client === null) {
      return;
    }
    const res = await sayHello(client!, peerIdInput, relayPeerIdInput);
    setHelloFrom(res);
  };

  return (
    <div className="App">
      <header>
        <img src={logo} className="logo" alt="logo" />
      </header>

      <div className="content">
        {isConnected ? (
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
              <h2>Say hello!</h2>
              <p>
                To connect with another Open the application in another browser
                and say hello
              </p>
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
              <div className="row">
                <button className="btn btn-hello" onClick={doSayHello}>
                  say hello
                </button>
              </div>
            </div>
          </>
        ) : (
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
        )}

        {helloFrom && (
          <>
            <h2>Hello from</h2>
            <div> {helloFrom} </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
