import { useRecoilValue } from "recoil";
import { clientState } from "../appState";
import { TextWithLabel } from "./TextInput";

export const ConnectedInfo = () => {
  const client = useRecoilValue(clientState);
  if (client === null) {
    return <></>;
  }

  return (
    <>
      <h1>Connected</h1>
      <TextWithLabel text={"Peer id:"} value={client.selfPeerId} />
      <TextWithLabel text={"Relay peer id:"} value={client.selfPeerId} />
    </>
  );
};
