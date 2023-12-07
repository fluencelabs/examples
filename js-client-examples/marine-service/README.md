# Getting Started with Fluence

This example demonstrates how to use marine services via JS client. It will work both in frontend and backend environments. The wasm file from the example has been taken from [this](https://github.com/fluencelabs/examples/tree/main/marine-examples/greeting) example. 

> To learn how to build marine services, peek at `marine-examples` folder in this repository or in Marine [docs](https://fluence.dev/docs/marine-book/introduction).

> To run this example you need `@latest` version of Fluence CLI. You can find installation guide [here](https://github.com/fluencelabs/cli).

## Getting started

Go to `src/frontend` folder:

```bash
cd ./src/frontend
```

Install dependencies:

```bash
npm i
```

Run aqua compiler:

```bash
fluence aqua
```

Start the dev server

```bash
npm run dev
```

Click on the link in console output. Window on `localhost:5173` should open

## Learn more

To learn more, refer to the [documentation page](https://fluence.dev//docs/build/js-client/js-client)
