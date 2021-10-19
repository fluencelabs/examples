import { atom, selector } from "recoil";

export const isConnectedState = atom<boolean>({
  key: "isConnectedState",
  default: false,
});

export const selfPeerIdState = atom<string | null>({
  key: "selfPeerIdState",
  default: null,
});

export const relayState = atom<string | null>({
  key: "relayState",
  default: null,
});

export const serviceIdState = atom<string | null>({
  key: "serviceIdState",
  default: null,
});

export const wasmState = atom<string>({
  key: "serviceState",
  default: "QmSvjkzXbXYwFXcWuFWqFdksvQDgpCeADNxkgkfzCLA4rk",
});

export const rpcAddrState = atom<string | null>({
  key: "rpcAddrState",
  default: null,
});

export const fileCIDState = atom<string | null>({
  key: "fileCIDState",
  default: "QmSvjkzXbXYwFXcWuFWqFdksvQDgpCeADNxkgkfzCLA4rk",
});

export const fileSizeState = atom<string | null>({
  key: "fileSizeState",
  default: null,
});

export const fileSizeCIDState = atom<string | null>({
  key: "fileSizeCIDState",
  default: null,
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
