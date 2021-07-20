import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.scss";

import { createClient, FluenceClient } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { getRelayTime } from "./_aqua/getting-started";

const relayNode = krasnodar[0];

function App() {
  const [client, setClient] = useState<FluenceClient | null>(null);
  const [relayTime, setRelayTime] = useState<Date | null>(null);

  useEffect(() => {
    createClient(relayNode)
      .then((client) => setClient(client))
      .catch((err) => console.log("Client initialization failed", err));
  }, [client]);

  const doGetRelayTime = async () => {
    if (!client) {
      return;
    }

    const time = await getRelayTime(client, relayNode.peerId);
    setRelayTime(new Date(time));
  };

  const isConnected = client !== null;

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
