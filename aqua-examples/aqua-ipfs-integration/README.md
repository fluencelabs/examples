# IPFS code execution example
This example showcases 2 things:
1. how it's possible to store .wasm modules on IPFS, then deploy them to Fluence as a service
2. ability to process IPFS files via a Fluence service. In this example, we get a size of a file

## Learn about AquaIPFS
See [Aqua Book](https://doc.fluence.dev/aqua-book/libraries/aqua-ipfs).

## How to run & use this example
### Web example
1. Run it
```
cd web
npm i
npm start
```

2. Press "deploy"
3. Copy WASM service CID and press "get_size"

### NodeJS example
```
cd nodejs
npm i
npm start
```

## Aqua implementation
The business logic is implemented in Aqua in [process.aqua](aqua/aqua/process.aqua)

