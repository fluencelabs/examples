import { useRecoilValue } from "recoil";
import { useRemoveService } from "../appLogic";
import { serviceIdState, wasmState } from "../appState";
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
      <TextWithLabel text={"process_files.wasm CID:"} value={wasm} />
      <TextWithLabel text={"Service ID:"} value={serviceId} />
    </>
  );
};
