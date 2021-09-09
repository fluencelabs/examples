import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.scss";

import { FluencePeer } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { getRelayTime } from "./_aqua/getting-started";

const relayNode = krasnodar[0];

function App() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [relayTime, setRelayTime] = useState<Date | null>(null);


  useEffect(() => {
    FluencePeer.default.init({ connectTo: relayNode })
      .then(() => {
        setIsConnected(true);
      })
      .catch((err) => console.log("Client initialization failed", err));
  }, [isConnected]);

  const onGetRelayTimeBtnClick = async () => {
    if (!isConnected) {
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
        <h1>Status: {isConnected ? "Connected" : "Disconnected"}</h1>
        <button className="btn" onClick={onGetRelayTimeBtnClick}>
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
