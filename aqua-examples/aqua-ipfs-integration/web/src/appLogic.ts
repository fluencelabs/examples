import { Fluence } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { useSetRecoilState, useRecoilValue, useRecoilState } from "recoil";
import {
  deploy_service,
  put_file_size,
  remove_service,
  get_external_api_multiaddr,
} from "@fluencelabs/ipfs-execution-aqua";
import {
  isConnectedState,
  rpcAddrState,
  wasmState,
  serviceIdState,
  fileCIDState,
  fileSizeState,
  fileSizeCIDState,
  relayState,
  selfPeerIdState,
} from "./appState";
import { decapsulateP2P, fromOption } from "./util";

export const relayNodes = [krasnodar[2], krasnodar[3], krasnodar[4]];

const requestRpcAddr = async () => {
  let result = await get_external_api_multiaddr(
    Fluence.getStatus().relayPeerId!
  );
  console.log("getRpcAddr result", result);
  let rpcAddr = result.multiaddr;
  return decapsulateP2P(rpcAddr);
};

export const useClientConnect = () => {
  const setIsConnected = useSetRecoilState(isConnectedState);
  const setRelay = useSetRecoilState(relayState);
  const setSelfPeerId = useSetRecoilState(selfPeerIdState);
  const setRpcAddr = useSetRecoilState(rpcAddrState);

  const connect = async (relayPeerId: string) => {
    try {
      await Fluence.start({ connectTo: relayPeerId });
      setIsConnected(true);
      setRelay(Fluence.getStatus().relayPeerId!);
      setSelfPeerId(Fluence.getStatus().peerId!);
      const addr = await requestRpcAddr();
      setRpcAddr(addr!);
    } catch (err) {
      console.log("Client initialization failed", err);
    }
  };

  return connect;
};

export const useDeployService = () => {
  const relay = useRecoilValue(relayState);
  const wasm = useRecoilValue(wasmState);
  const rpcAddr = useRecoilValue(rpcAddrState);
  const client = useRecoilValue(isConnectedState);
  const setServiceId = useSetRecoilState(serviceIdState);

  return async () => {
    console.log("wasm %s rpcAddr %s", wasm, rpcAddr);
    if (client === null || wasm === null || rpcAddr === null) {
      return;
    }

    var service_id = await deploy_service(
      relay!,
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
  const relay = useRecoilValue(relayState);
  const rpcAddr = useRecoilValue(rpcAddrState);
  const isConnected = useRecoilValue(isConnectedState);
  const serviceId = useRecoilValue(serviceIdState);
  const fileCID = useRecoilValue(fileCIDState);
  const setFileSize = useSetRecoilState(fileSizeState);
  const setFileSizeCID = useSetRecoilState(fileSizeCIDState);

  return async () => {
    if (!isConnected || serviceId === null || rpcAddr === null) {
      return;
    }

    var putResult = await put_file_size(
      relay!,
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
  const relay = useRecoilValue(relayState);
  const isConnected = useRecoilValue(isConnectedState);
  const [serviceId, setServiceId] = useRecoilState(serviceIdState);
  const setFileCID = useSetRecoilState(fileCIDState);
  const setFileSize = useSetRecoilState(fileSizeState);
  const setFileSizeCID = useSetRecoilState(fileSizeCIDState);

  return async () => {
    console.dir(isConnected, serviceId);
    if (!isConnected || serviceId === null) {
      return;
    }

    await remove_service(relay!, serviceId, {
      ttl: 10000,
    });
    console.log(`Service ${serviceId} was removed`);
    setServiceId(null);
    setFileCID(null);
    setFileSize(null);
    setFileSizeCID(null);
  };
};
