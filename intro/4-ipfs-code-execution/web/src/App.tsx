import React from "react";
import logo from "./logo.svg";
import "./App.scss";

import { gotRpcAddrState, isConnectedState, isDeployedState } from "./state";
import { useRecoilValue } from "recoil";
import { ConnectedInfo } from "./Components/ConnectedInfo";
import { ConnectionForm } from "./Components/ConnectionForm";
import { IpfsForm } from "./Components/IpfsForm";
import { IpfsDeploymentInfo } from "./Components/IpfsDeploymentInfo";
import { SizeCalcForm } from "./Components/SizeCalcForm";

function App() {
  const isConnected = useRecoilValue(isConnectedState);
  const gotRpcAddr = useRecoilValue(gotRpcAddrState);
  const isDeployed = useRecoilValue(isDeployedState);

  console.log(
    "isConnected gotRpcAddr deployed\n",
    isConnected,
    gotRpcAddr,
    isDeployed
  );

  return (
    <div className="App">
      <header>
        <img src={logo} className="logo" alt="logo" />
      </header>

      <div className="content">
        {!isConnected && <ConnectionForm />}
        {isConnected && <ConnectedInfo />}
        {isConnected && gotRpcAddr && !isDeployed && <IpfsForm />}
        {isDeployed && (
          <>
            <IpfsDeploymentInfo />
            <SizeCalcForm />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
