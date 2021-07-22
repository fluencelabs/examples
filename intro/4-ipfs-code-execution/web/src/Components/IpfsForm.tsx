import { useRecoilState } from "recoil";
import { useDeployService } from "../appLogic";
import { rpcAddrState, wasmState } from "../appState";
import { TextInput } from "./TextInput";

export const IpfsForm = () => {
  const [rpcAddr, setRpcAddr] = useRecoilState(rpcAddrState);
  const [wasm, setWasm] = useRecoilState(wasmState);
  const deployService = useDeployService();

  return (
    <>
      <h2>Deploy service from IPFS</h2>
      <div className="article">
        <p>Now we can deploy service from IPFS into Fluence network</p>
        <p>
          To do so, please specify IPFS RPC address of process_files.wasm from,
          and the CID of WebAssembly module to use (process_files.wasm)
        </p>
      </div>

      <TextInput
        text={"IPFS RPC address"}
        value={rpcAddr}
        setValue={setRpcAddr}
      />

      <TextInput
        text={"process_files.wasm CID"}
        value={wasm}
        setValue={setWasm}
      />
      <div className="row">
        <button className="btn btn-right" onClick={deployService}>
          deploy service
        </button>
      </div>
    </>
  );
};
