import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.scss";

import { FluencePeer } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { getRelayTime } from "./_aqua/getting-started";

const relayNode = krasnodar[0];

function App() {
  const [peer, setPeer] = useState<FluencePeer | null>(null);
  const [relayTime, setRelayTime] = useState<Date | null>(null);

  useEffect(() => {
    const peer = new FluencePeer();
    peer.init({ connectTo: relayNode })
      .then((client) => setPeer(peer))
      .catch((err) => console.log("Client initialization failed", err));
  }, [peer]);

  const doGetRelayTime = async () => {
    if (!peer) {
      return;
    }

    const time = await getRelayTime(peer, relayNode.peerId);
    setRelayTime(new Date(time));
  };

  const isConnected = peer !== null;

  return (
    <div className="App">
      <header>
        <img src={logo} className="logo" alt="logo" />
      </header>

      <div className="content">
        <h1>Status: {isConnected ? "Connected" : "Disconnected"}</h1>
        <button className="btn" onClick={doGetRelayTime}>
          Get relay time
        </button>
        {relayTime && (
          <>
            <h2>Relay time:</h2>
            <div>{relayTime?.toLocaleString() || ""}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
