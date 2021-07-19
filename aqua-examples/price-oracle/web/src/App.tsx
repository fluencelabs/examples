import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.scss";

import { createClient, FluenceClient } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { get_price } from "./_aqua/get_crypto_prices";

const relayNode = krasnodar[0];

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never;

type Result = Unpromise<ReturnType<typeof get_price>>;

const TextInput = (props: {
  text: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="row">
      <label className="label bold">{props.text}</label>
      <input
        className="input"
        type="text"
        onChange={(e) => props.setValue(e.target.value)}
        value={props.value}
        required={true}
      />
    </div>
  );
};

function App() {
  const [client, setClient] = useState<FluenceClient | null>(null);
  const [coin, setCoin] = useState<string>("dogecoin");
  const [currency, setCurrency] = useState<string>("usd");
  const [node, setNode] = useState<string>(
    "12D3KooWCMr9mU894i8JXAFqpgoFtx6qnV1LFPSfVc3Y34N4h4LS"
  );
  const [pgSid, setPgSid] = useState<string>(
    "c315073d-4311-4db3-be57-8f154f032d28"
  );
  const [meanSid, setMeanSid] = useState<string>(
    "dd47389f-25d9-4870-a2a9-909359e73580"
  );
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    createClient(relayNode.multiaddr)
      .then(setClient)
      .catch((err) => console.log("Client initialization failed", err));
  }, [client]);

  const isConnected = client !== null;

  const doGetPrice = async () => {
    if (client === null) {
      return;
    }
    try {
      const res = await get_price(
        client!,
        coin,
        currency,
        node,
        pgSid,
        meanSid
      );
      console.log("Retrieved result: ", res);
      setResult(res);
    } catch (err) {
      setResult({ error_msg: err.toString(), success: false, result: 0 });
    }
  };

  return (
    <div className="App">
      <header>
        <img src={logo} className="logo" alt="logo" />
      </header>

      <div className="content">
        <h1>Status: {isConnected ? "Connected" : "Disconnected"}</h1>
        <p>Simple app to get eth-based coin price</p>
        <div>
          <h2>Get coin price</h2>
          <TextInput text={"coin"} value={coin} setValue={setCoin} />
          <TextInput
            text={"currency"}
            value={currency}
            setValue={setCurrency}
          />
          <TextInput text={"node"} value={node} setValue={setNode} />
          <TextInput text={"pgSid"} value={pgSid} setValue={setPgSid} />
          <TextInput text={"meanSid"} value={meanSid} setValue={setMeanSid} />

          <div className="row">
            <button className="btn btn-hello" onClick={() => doGetPrice()}>
              Get price
            </button>
          </div>
        </div>
        <h2>Coin price</h2>
        {result && result.success && (
          <p className="success">The price is: {result.result}</p>
        )}
        {result && !result.success && (
          <p className="error">Error: {result.error_msg}</p>
        )}
      </div>
    </div>
  );
}

export default App;
