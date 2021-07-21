import { useRecoilState, useRecoilValue } from "recoil";
import {
  fileCIDState,
  fileSizeCIDState,
  fileSizeState,
  rpcAddrState,
  useGetFileSize,
} from "../state";

export const SizeCalcForm = () => {
  const rpcAddr = useRecoilValue(rpcAddrState);
  const [fileCID, setFileCID] = useRecoilState(fileCIDState);
  const fileSize = useRecoilValue(fileSizeState);
  const fileSizeCID = useRecoilValue(fileSizeCIDState);
  const getFileSize = useGetFileSize();

  return (
    <>
      <div>
        <h2>Get file size</h2>
        <p className="p">
          Upload any file to IPFS node
          <p>
            <b>{rpcAddr}</b>
          </p>
          paste CID here and get the size of that file via ProcessFiles service
          you have just deployed
        </p>
        <div className="row">
          <label className="label bold">IPFS CID</label>
          <input
            className="input"
            type="text"
            onChange={(e) => setFileCID(e.target.value)}
            value={fileCID}
          />
        </div>
        <div className="row">
          <button className="btn btn-hello" onClick={getFileSize}>
            get size
          </button>
        </div>
      </div>
      <div className="row">
        <label className="label bold">File Size:</label>
        <label className="mono">{fileSize}</label>
      </div>
      <div className="row">
        <label className="label bold">
          File size is uploaded to IPFS as CID:
        </label>
        <label className="mono">{fileSizeCID}</label>
      </div>
    </>
  );
};
