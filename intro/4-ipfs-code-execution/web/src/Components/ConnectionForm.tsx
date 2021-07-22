import { relayNodes, useClientConnect } from "../appLogic";

export const ConnectionForm = () => {
  const connect = useClientConnect();

  return (
    <>
      <h1>Intro 4: IPFS storage + Fluence compute</h1>
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
  );
};
