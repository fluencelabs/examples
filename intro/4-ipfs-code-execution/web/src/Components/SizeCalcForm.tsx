import { useRecoilState, useRecoilValue } from "recoil";
import { fileCIDState, rpcAddrState, useGetFileSize } from "../state";
import { TextInput } from "./TextInput";

export const SizeCalcForm = () => {
  const rpcAddr = useRecoilValue(rpcAddrState);
  const [fileCID, setFileCID] = useRecoilState(fileCIDState);
  const getFileSize = useGetFileSize();

  return (
    <>
      <h2>Get file size</h2>
      <div className="article">
        <p>
          Upload any file to IPFS node
          <b>{rpcAddr}</b>
          paste CID here and get the size of that file via ProcessFiles service
          you have just deployed
        </p>
      </div>
      <TextInput text={"IPFS CID"} value={fileCID} setValue={setFileCID} />

      <div className="row">
        <button className="btn btn-right" onClick={getFileSize}>
          get size
        </button>
      </div>
    </>
  );
};
