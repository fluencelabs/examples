# NEAR + Fluence + Aqua Integrations

**WIP**

We experiment with both a [Fluence JS]() node based on the NEAR ??? SDK and [Wasm services] wrapping [NEAR RPC API](https://docs.near.org/docs/api/rpc).  A [NEAR CLI](https://docs.near.org/docs/tools/near-cli) integration is planned for the near future.

## Fluence JS NEAR Signing Peer

Signing transaction and messages is a critical operation both on- and off-chain and an integral part of most Web3 workflows. In Fluence's open, permissionless peer-to-peer network maintaining data privacy is a challenge. For example, passing the password for a keyfile or a private key is quite risky, even though the communication channel is end-to-end encrypted, as the "end" of the channel is the node hosting the target service. Hence, a node can easily eavesdrop on decrypted traffic and abscond with your password or key and presumably, your funds. Of course, you could run your own node to eliminate the such exploits but that means, well, allocating resources to manage your own node(s) and possibly, Wasm signing services.

A slightly more advantageous solution might be to implement a Signing node with Fluence JS, which is exactly what we have done for this example. While a Fluence JS peer does not allow for the hosting of arbitrary services, it does allow to easily wrap the NEAR JS SDK and provide ...

[NEAR API JS](https://docs.near.org/docs/api/javascript-library)


## Fluence Wasm NEAR Services

In the `services` directory, you find a minimal Wasm adapter for [NEAR RPC API](https://docs.near.org/docs/api/rpc) to get you started. Since we are connecting to on-chain resources via JSON-RPC, we need our service module to have access to the [cUrl adapter](../near-examples/services/curl-adapter/).
