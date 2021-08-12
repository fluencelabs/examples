import { get_external_api_multiaddr } from "@fluencelabs/aqua-ipfs-ts";
import { FluenceClient, createClient } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { useSetRecoilState, useRecoilValue, useRecoilState } from "recoil";
import {
  deploy_service,
  put_file_size,
  remove_service,
} from "@fluencelabs/ipfs-execution-aqua";
import {
  clientState,
  rpcAddrState,
  wasmState,
  serviceIdState,
  fileCIDState,
  fileSizeState,
  fileSizeCIDState,
} from "./appState";
import { decapsulateP2P, fromOption } from "./util";

export const relayNodes = [krasnodar[0], krasnodar[1], krasnodar[2]];

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
