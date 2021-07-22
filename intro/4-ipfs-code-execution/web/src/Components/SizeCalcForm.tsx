import { useRecoilState, useRecoilValue } from "recoil";
import { useGetFileSize } from "../appLogic";
import { fileCIDState, rpcAddrState } from "../appState";
import { TextInput } from "./TextInput";

export const SizeCalcForm = () => {
  const [rpcAddr, setRpcAddr] = useRecoilState(rpcAddrState);
  const [fileCID, setFileCID] = useRecoilState(fileCIDState);
  const getFileSize = useGetFileSize();

  return (
    <>
      <h2>Get file size</h2>
      <div className="article">
        <p>
          Upload any file to IPFS node <b>{rpcAddr}</b>
        </p>
        <p>
          And paste CID here and get the size of that file via ProcessFiles
          service you have just deployed
        </p>
      </div>
      <TextInput
        text={"IPFS RPC address"}
        value={rpcAddr}
        setValue={setRpcAddr}
      />
      <TextInput text={"IPFS CID"} value={fileCID} setValue={setFileCID} />

      <div className="row">
        <button className="btn btn-right" onClick={getFileSize}>
          get size
        </button>
      </div>
    </>
  );
};
