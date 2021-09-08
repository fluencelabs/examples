import { useRecoilValue } from "recoil";
import { isConnectedState, selfPeerIdState } from "../appState";
import { TextWithLabel } from "./TextInput";

export const ConnectedInfo = () => {
  const selfPeerId = useRecoilValue(selfPeerIdState);
  const client = useRecoilValue(isConnectedState);
  if (client === null) {
    return <></>;
  }

  return (
    <>
      <h1>Connected</h1>
      <TextWithLabel text={"Peer id:"} value={selfPeerId} />
      <TextWithLabel text={"Relay peer id:"} value={selfPeerId} />
    </>
  );
};
