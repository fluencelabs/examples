import { useRecoilValue } from "recoil";
import { serviceIdState, useRemoveServuce, wasmState } from "../state";
import { copyToClipboard } from "../util";

export const IpfsDeploymentInfo = () => {
  const wasm = useRecoilValue(wasmState);
  const serviceId = useRecoilValue(serviceIdState);
  const removeService = useRemoveServuce;

  return (
    <>
      <h2>Deployed</h2>
      <table>
        <tr>
          <td className="bold">process_files.wasm CID:</td>
          <td className="mono">{wasm}</td>
          <td>
            <button
              className="btn-clipboard"
              onClick={() => copyToClipboard(wasm)}
            >
              <i className="gg-clipboard"></i>
            </button>
          </td>
        </tr>
        <tr>
          <td className="bold">ProcessFiles service ID:</td>
          <td className="mono">{serviceId}</td>
          <button className="btn-clipboard" onClick={removeService}>
            <i className="gg-trash"></i>
          </button>
        </tr>
      </table>
    </>
  );
};
