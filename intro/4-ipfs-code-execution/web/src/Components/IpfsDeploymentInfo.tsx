import { useRecoilValue } from "recoil";
import { serviceIdState, useRemoveService, wasmState } from "../state";
import { copyToClipboard } from "../util";
import { TextWithLabel } from "./TextInput";

export const IpfsDeploymentInfo = () => {
  const wasm = useRecoilValue(wasmState);
  const serviceId = useRecoilValue(serviceIdState);
  const removeService = useRemoveService();

  return (
    <>
      <h2>
        Service deployed{" "}
        <button className="btn-inline" onClick={removeService}>
          remove
        </button>
      </h2>
      <div className="article">
        <p>
          Service deployed into Fluence network. You can observe it's service ID
          as well as the CID of the wasm file used to create the service
        </p>
      </div>
      <TextWithLabel text={"CID:"} value={wasm} />
      <TextWithLabel text={"Service ID:"} value={serviceId} />
    </>
  );
};
