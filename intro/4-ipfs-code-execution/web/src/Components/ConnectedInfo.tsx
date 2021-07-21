import { useRecoilValue } from "recoil";
import { clientState } from "../state";
import { copyToClipboard } from "../util";

export const ConnectedInfo = () => {
  const client = useRecoilValue(clientState);
  if (client === null) {
    return <></>;
  }

  return (
    <>
      <h1>Connected</h1>
      <table>
        <thead>
          <tr>
            <td className="bold">Peer id:</td>
            <td className="mono">{client.selfPeerId}</td>
            <td>
              <button
                className="btn-clipboard"
                onClick={() => copyToClipboard(client.selfPeerId)}
              >
                <i className="gg-clipboard"></i>
              </button>
            </td>
          </tr>
          <tr>
            <td className="bold">Relay peer id:</td>
            <td className="mono">{client.relayPeerId}</td>
            <td>
              <button
                className="btn-clipboard"
                onClick={() => copyToClipboard(client.relayPeerId!)}
              >
                <i className="gg-clipboard"></i>
              </button>
            </td>
          </tr>
        </thead>
      </table>
    </>
  );
};
