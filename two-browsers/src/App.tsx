import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.scss";

import { createClient, FluenceClient } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { sayHello } from "./_aqua/getting-started";

const relayNodes = [krasnodar[0], krasnodar[1], krasnodar[2]];

function App() {
  const [client, setClient] = useState<FluenceClient | null>(null);
  const [helloFrom, setHelloFrom] = useState<string | null>(null);

  const [peerIdInput, setPeerIdInput] = useState<string>("");
  const [relayPeerIdInput, setRelayPeerIdInput] = useState<string>("");

  const isConnected = client !== null;

  const connect = (relayPeerId: string) => {
    createClient(relayPeerId)
      .then((client) => {
        client.callServiceHandler.on("HelloWorld", "recieveHello", (args) => {
          const [from] = args;
          setHelloFrom("Hello from" + from);
          return "Hello back to" + from;
        });
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
        <div>Status: {isConnected ? "Connected" : "Disconnected"}</div>
        {isConnected ? (
          <div>
            <div>Peer id: {client!.selfPeerId}</div>
            <div>Connected to: {client!.relayPeerId} </div>
          </div>
        ) : (
          <ul>
            {relayNodes.map((x) => (
              <li key={x.peerId}>
                <div>{x.peerId}</div>
                <button onClick={() => connect(x.multiaddr)}>Connect</button>
              </li>
            ))}
          </ul>
        )}
        <div>
          <label>Peer id</label>
          <input
            onChange={(e) => setPeerIdInput(e.target.value)}
            value={peerIdInput}
          />
          <label>Relay</label>
          <input
            onChange={(e) => setRelayPeerIdInput(e.target.value)}
            value={relayPeerIdInput}
          />
          <button onClick={doSayHello}>Say hello</button>
        </div>
        <div> {helloFrom} </div>
      </div>
    </div>
  );
}

export default App;
