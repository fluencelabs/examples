# Examples

This repo holds a collection of examples on how to build distributed applications with the Fluence stack.

The `aqua-examples` directory contains examples demonstrating the use of Aqua to compose decentralized applications from distributed services, whereas the `marine-examples` directory contains examples with respect to the development of Rust Wasm modules.

If you encounter a problem, please post an Issue or open a PR. If you want to contribute an example, please contact us by opening an Issue or a draft PR. See the [contribution guidelines](https://github.com/fluencelabs/fluence/blob/master/CONTRIBUTING.md).

## Resource Directory

* The [Ceramic Integration](./aqua-examples/aqua-ceramic-integration/) provides an example Wasm adapter for the Ceramic [CLI API](https://developers.ceramic.network/build/cli/api/) and [HTTP API](https://developers.ceramic.network/build/http/api/).
  * Rust Wasm, Aqua

* The [IPFS Integration](./aqua-examples/e/aqua-ipfs-integration) shows how to use the [aqua-ipfs](https://github.com/fluencelabs/aqua-ipfs) library to deploy single-module Wasm services to a Fluence node from a IPFS sidecar
  * Fluence JS, Aqua

* The [Near Integration](./aqua-examples/near-integration/) provides integration examples for the Near API JS and RPC API. We use Fluence JS to implement a minimal Near signing service and wrap a few select RPC examples into a Wasm module.
  * Fluence JS, Rust Wasm, Aqua

* The [Timestamp Oracle](./aqua-examples/ts-oracle) illustrates how to use builtin services to  acquire timestamps from a node's Kademlia neighborhood and then process those timesstamps using Wasm services into point or range estimates.
  * Aqua, Rust Wasm

* The [Price Oracle](./aqua-examples/price-oracle) provides a stylized example of how to create a price stream oracle using Rust Wasm services. Further provides a Fluent JS and Web client examples.
  * Rust Wasm, Fluence JS, Aqua
  
* The [EIP712 Validator Node](https://github.com/fluencelabs/eip712-validation-node) provides a stylized example of validating signed EIP712 forms and storing the results in a local sqlite database. We use Fluence JS to implement both peer and client, where the peer expose sqlite crud interfaces allowing other peers to query validations and form a consensus.
  * Rust Wasm, Fluence JS, Aqua, SQLite
  
## License

Unless otherwise indicated, the applicable license is [Apache 2.0](https://github.com/fluencelabs/fluence/blob/master/LICENSE).
