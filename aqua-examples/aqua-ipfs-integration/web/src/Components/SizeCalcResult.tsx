import { useRecoilValue } from "recoil";
import { fileSizeCIDState, fileSizeState } from "../appState";
import { TextWithLabel } from "./TextInput";

export const SizeCalcResult = () => {
  const fileSize = useRecoilValue(fileSizeState);
  const fileSizeCID = useRecoilValue(fileSizeCIDState);

  return (
    <>
      <h2>Result</h2>
      <div className="article">
        <p>
          File size has been calculated and displayed below. Also the result of
          the calculation has been uploaded to IPFS and is available under it's
          CID
        </p>
      </div>
      <TextWithLabel text="File size:" value={fileSize} />
      <TextWithLabel text="File size IPFS CID:" value={fileSizeCID} />
    </>
  );
};
