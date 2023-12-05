# Getting Started with Fluence

This is a sample Node.js application using Fluence JS Client. It exposes a calculator service written in Typescript which can be accessed from Fluence Network using Aqua language

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

Start the Node.js application:

```bash
npm start
```

This should start listening to incoming particles from Fluence Network.

Try interacting with the application by executing aqua function:

```bash
fluence run -f 'demoCalculation()'
```

## Learn more

To learn more, refer to the [documentation page](https://fluence.dev//docs/build/js-client/js-client)
