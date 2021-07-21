import { Multiaddr, protocols } from "multiaddr";

export const decapsulateP2P = (rpcAddr: string) => {
  return new Multiaddr(rpcAddr)
    .decapsulateCode(protocols.names.p2p.code)
    .toString();
};

export const fromOption = <T>(opt: T | T[] | null): T | null => {
  if (Array.isArray(opt)) {
    if (opt.length === 0) {
      return null;
    }

    opt = opt[0];
  }
  if (opt === null) {
    return null;
  }

  return opt;
};
