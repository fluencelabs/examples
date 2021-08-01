import { FluenceClient } from "@fluencelabs/fluence";
import { atom, selector } from "recoil";

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
  default: "Qmf8fH2cDZXGKS9uDGBcHxv5uQ51ChrigdZKe3QxS2C1AF",
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
