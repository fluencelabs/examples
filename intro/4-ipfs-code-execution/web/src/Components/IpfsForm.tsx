import { useRecoilState, useResetRecoilState } from "recoil";
import { rpcAddrState, useDeployService, wasmState } from "../state";
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
          process_files.wasm will be downloaded via IPFS to the Fluence node,
          and then a service will be dynamically created from it! After that,
          you will be able to use that service to get sizes of IPFS files!
        </p>
        <p>
          To do so, please specify IPFS RPC address of process_files.wasm from,
          and the CIP of WebAssembly module to use (process_files.wasm)
        </p>
      </div>

      <TextInput
        text={"IPFS RPC address"}
        value={rpcAddr}
        setValue={setRpcAddr}
      />

      <TextInput
        text={"process_files.wasm module CID"}
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
