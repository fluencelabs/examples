import { relayNodes, useClientConnect } from "../appLogic";

export const ConnectionForm = () => {
  const connect = useClientConnect();

  return (
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
  );
};
