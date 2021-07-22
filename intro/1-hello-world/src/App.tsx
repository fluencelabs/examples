import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.scss";

import { createClient, FluenceClient } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { sayHello } from "./_aqua/getting-started";

const relayNodes = [krasnodar[0], krasnodar[1], krasnodar[2]];

function App() {
  const [client, setClient] = useState<FluenceClient | null>(null);
  const [helloMessage, setHelloMessage] = useState<string | null>(null);

  const [peerIdInput, setPeerIdInput] = useState<string>("");
  const [relayPeerIdInput, setRelayPeerIdInput] = useState<string>("");

  const connect = (relayPeerId: string) => {
    createClient(relayPeerId)
      .then((client) => {
        // Register handler for this call in aqua:
        // HelloPeer.hello(%init_peer_id%)
        client.callServiceHandler.on("HelloPeer", "hello", (args) => {
          const [from] = args;
          setHelloMessage("Hello from: \n" + from);
          return "Hello back to you, \n" + from;
        });
        setClient(client);
      })
      .catch((err) => console.log("Client initialization failed", err));
  };

  const helloBtnOnClick = async () => {
    if (client === null) {
      return;
    }
    // Using aqua is as easy as calling a javascript funсtion
    const res = await sayHello(client!, peerIdInput, relayPeerIdInput);
    setHelloMessage(res);
  };

  const isConnected = client !== null;

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
              <tbody>
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
              </tbody>
            </table>

            <div>
              <h2>Say hello!</h2>
              <p className="p">
                Now try opening a new tab with the same application. Copy paste
                the peer id and relay from the second tab and say hello!
              </p>
              <div className="row">
                <label className="label bold">Target peer id</label>
                <input
                  className="input"
                  type="text"
                  onChange={(e) => setPeerIdInput(e.target.value)}
                  value={peerIdInput}
                />
              </div>
              <div className="row">
                <label className="label bold">Target relay</label>
                <input
                  className="input"
                  type="text"
                  onChange={(e) => setRelayPeerIdInput(e.target.value)}
                  value={relayPeerIdInput}
                />
              </div>
              <div className="row">
                <button className="btn btn-hello" onClick={helloBtnOnClick}>
                  say hello
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1>Intro 1: P2P browser-to-browser</h1>
            <h2>Pick a relay</h2>
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

        {helloMessage && (
          <>
            <h2>Message</h2>
            <div> {helloMessage} </div>
          </>
        )}
      </div>
    </div>
  );
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export default App;
