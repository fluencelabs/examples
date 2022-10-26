# IPFS code execution example

This example showcases 2 things:

1. how it's possible to store .wasm modules on IPFS, then deploy them to Fluence as a service
2. ability to process IPFS files via a Fluence service. In this example, we get a size of a file

## Learn about AquaIPFS

See [Aqua Book](https://fluence.dev/docs/aqua-book/introduction).

## How to run & use this example

You need npm v7 or later to run the examples

### Web example

1. Run it

    ```bash
    npm i
    npm run build -w aqua
    npm start -w web
    ```

2. Press "deploy"
3. Copy WASM service CID and press "get_size"

### NodeJS example

```bash
npm i
npm run build -w aqua
npm start -w nodejs
```

## Aqua implementation

The business logic is implemented in Aqua in [process.aqua](aqua/aqua/process.aqua)
