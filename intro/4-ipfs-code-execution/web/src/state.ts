import { get_external_api_multiaddr } from "@fluencelabs/aqua-ipfs";
import {
  deploy_service,
  put_file_size,
  remove_service,
} from "@fluencelabs/ipfs-execution";
import { createClient, FluenceClient } from "@fluencelabs/fluence";
import { stage } from "@fluencelabs/fluence-network-environment";
import {
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import { decapsulateP2P, fromOption } from "./util";

export const relayNodes = [stage[0], stage[1], stage[2]];

export const clientState = atom<FluenceClient | null>({
  key: "clientState",
  default: null,
  dangerouslyAllowMutability: true,
});

export const serviceIdState = atom<string | null>({
  key: "serviceIdState",
  default: null,
});

export const wasmState = atom<string>({
  key: "serviceState",
  default: "Qmf8fH2cDZXGKS9uDGBcHxv5uQ51ChrigdZKe3QxS2C1AF",
});

export const rpcAddrState = atom<string | null>({
  key: "rpcAddrState",
  default: null,
});

export const fileCIDState = atom<string | null>({
  key: "fileCIDState",
  default: null,
});

export const fileSizeState = atom<string | null>({
  key: "fileSizeState",
  default: null,
});

export const fileSizeCIDState = atom<string | null>({
  key: "fileSizeCIDState",
  default: null,
});

export const isConnectedState = selector({
  key: "isConnectedState",
  get: ({ get }) => {
    const client = get(clientState);

    return client !== null && client.isConnected;
  },
  dangerouslyAllowMutability: true,
});

export const gotRpcAddrState = selector({
  key: "getRpcAddrState",
  get: ({ get }) => {
    const rpcAddr = get(rpcAddrState);

    return rpcAddr !== null;
  },
});

export const isDeployedState = selector({
  key: "isDeployedState",
  get: ({ get }) => {
    const serviceId = get(serviceIdState);

    return serviceId !== null;
  },
});

export const hasResultState = selector({
  key: "hasResultState",
  get: ({ get }) => {
    const fileSize = get(fileSizeState);
    return fileSize !== null;
  },
});

const getRpcAddr = async (client: FluenceClient) => {
  if (client === null) {
    console.log("getRpcAddr client is null");
    return;
  }

  let result = await get_external_api_multiaddr(client, client.relayPeerId!);
  console.log("getRpcAddr result", result);
  let rpcAddr = result.multiaddr;
  return decapsulateP2P(rpcAddr);
};

export const useClientConnect = () => {
  const setClient = useSetRecoilState(clientState);
  const setRpcAddr = useSetRecoilState(rpcAddrState);

  const connect = async (relayPeerId: string) => {
    try {
      const client = await createClient(relayPeerId);
      const addr = await getRpcAddr(client);
      setRpcAddr(addr!);
      setClient(client);
    } catch (err) {
      console.log("Client initialization failed", err);
    }
  };

  return connect;
};

export const useDeployService = () => {
  const wasm = useRecoilValue(wasmState);
  const rpcAddr = useRecoilValue(rpcAddrState);
  const client = useRecoilValue(clientState);
  const setServiceId = useSetRecoilState(serviceIdState);

  return async () => {
    console.log("wasm %s rpcAddr %s", wasm, rpcAddr);
    if (client === null || wasm === null || rpcAddr === null) {
      return;
    }

    var service_id = await deploy_service(
      client,
      client.relayPeerId!,
      wasm,
      rpcAddr,
      (msg, value) => console.log(msg, value),
      { ttl: 10000 }
    );
    service_id = fromOption(service_id);
    setServiceId(service_id);
  };
};

export const useGetFileSize = () => {
  const rpcAddr = useRecoilValue(rpcAddrState);
  const client = useRecoilValue(clientState);
  const serviceId = useRecoilValue(serviceIdState);
  const fileCID = useRecoilValue(fileCIDState);
  const setFileSize = useSetRecoilState(fileSizeState);
  const setFileSizeCID = useSetRecoilState(fileSizeCIDState);

  return async () => {
    if (client === null || serviceId === null || rpcAddr === null) {
      return;
    }

    var putResult = await put_file_size(
      client,
      client.relayPeerId!,
      fileCID!,
      rpcAddr,
      serviceId,
      (size) => setFileSize(size.toString()),
      (label, error) => setFileSize("Error: " + label + ": " + error),
      { ttl: 10000 }
    );
    putResult = fromOption(putResult);
    if (putResult === null) {
      return;
    }
    if (putResult.success) {
      setFileSizeCID(putResult.hash);
    } else {
      setFileSizeCID("Error: " + putResult.error);
    }
  };
};

export const useRemoveService = () => {
  const client = useRecoilValue(clientState);
  const [serviceId, setServiceId] = useRecoilState(serviceIdState);
  const setFileCID = useSetRecoilState(fileCIDState);
  const setFileSize = useSetRecoilState(fileSizeState);
  const setFileSizeCID = useSetRecoilState(fileSizeCIDState);

  return async () => {
    if (client === null || serviceId === null) {
      return;
    }

    await remove_service(client, client.relayPeerId!, serviceId, {
      ttl: 10000,
    });
    setServiceId(null);
    setFileCID(null);
    setFileSize(null);
    setFileSizeCID(null);
  };
};
