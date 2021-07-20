# IPFS code execution
This example showcases 2 things:
1. how it's possible to store .wasm modules on IPFS, then deploy them to Fluence as a service
2. ability to process IPFS files via a Fluence service. In this example, we get a size of a file

## How to run it
### Web
```
cd web
npm i
npm start
```

## Aqua implementation
The business logic is implemented in Aqua in [process.aqua](aqua/src/process_files.aqua)

