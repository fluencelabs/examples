import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.scss";

import { Fluence } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { getRelayTime } from "./_aqua/getting-started";

const relayNode = krasnodar[0];

function App() {
  const [relayTime, setRelayTime] = useState<Date | null>(null);


  useEffect(() => {
    Fluence.start({ connectTo: relayNode })
      .catch((err) => console.log("Client initialization failed", err));
  }, []);

  const onGetRelayTimeBtnClick = async () => {
    if (!Fluence.getStatus().isConnected) {
      return;
    }

    const time = await getRelayTime(relayNode.peerId);
    setRelayTime(new Date(time));
  };


  return (
    <div className="App">
      <header>
        <img src={logo} className="logo" alt="logo" />
      </header>

      <div className="content">
        <h1>Status: <span id="status">{Fluence.getStatus().isConnected ? "Connected" : "Disconnected"}</span></h1>
        <button id="btn" className="btn" onClick={onGetRelayTimeBtnClick}>
          Get relay time
        </button>
        {relayTime && (
          <>
            <h2>Relay time:</h2>
            <div id="relayTime">{relayTime?.toLocaleString() || ""}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
