# NEAR + Fluence + Aqua Integrations

**WIP**

We experiment with both a [Fluence JS]() node based on the NEAR ??? SDK and [Wasm services] wrapping [NEAR RPC API]() and [NEAR ???]().

## Fluence JS NEAR Signing Peer

Signing transactions is critical operation both on- and off-chain and an integral part of most Web3 workflows including DApps. In open, permissionless networks, like Fluence's peer-to-peer network, maintaining data privacy is a challenge. For example, passing the password for a keyfile or a private key is quite risky, even though the communication channel is end-to-end encrypted, as the "end" of the channel is the node hosting the target service. Hence, a node can easily eavesdrop on decrypted traffic and abscond with your password or key and the associated funding. Of course, you could run your own node to eliminate the MITM exploit but that means, well, running your own node and having to host or even implement the WASm modules to deal with the various signing processes.

A slightly more advantageous solution might be to implement a Signing node with Fluence JS which is exactly what we have done. While a Fluence JS peer does not allow for the hosting of arbitrary services, it does allow to easily wrap the NEAR JS SDK and provide ...



## Fluence Wasm NEAR Services
[NEAR API JS](https://docs.near.org/docs/api/javascript-library)

