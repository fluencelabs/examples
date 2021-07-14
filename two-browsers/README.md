# Getting Started with Fluence

This sample project demonstrates how fluence network can be accessed from the browser. As an example it retrieves the timestamp of the current time from the relay node. The project is based on an create-react-app template with slight modifications to integrate Fluence. The primary focus is the integration itself, i.e React could be swapped with a framework of your choice.

## Getting started

Run aqua compiler in watch mode:

```bash
npm run watch-aqua
```

Start the application

```bash
npm start
```

The browser window with `localhost:3000` should open

## How it works

The application can be split into two main building blocks: the runtime provided by the `@fluencelabs/fluence` package and the compiler for the `Aqua` language. The workflow is as follows:

1. You write aqua code
2. Aqua gets compiled into the typescript file
3. The typescript is build by the webpack (or any other tool of you choice) into js bunlde.

## Project structure

```
aqua                    (1)
 ┗ getting-started.aqua (3)
node_modules
public
src
 ┣ _aqua                (2)
 ┃ ┗ getting-started.ts (4)
 ┣ App.scss
 ┣ App.tsx
 ┣ index.css
 ┣ index.tsx
 ┣ logo.svg
 ┗ react-app-env.d.ts
package-lock.json
package.json
tsconfig.json
```

The project structure is based on the create-react-app template with some minor differences:

- `aqua` (1) contains the Aqua source code files. The complier picks them up and generate corresponding typescript file. See `getting-started.aqua` (3) and `getting-started.ts` respectively
- `src/_aqua` (2) is where the generated target files are places. The target directory is conveniently placed inside the sources directory which makes it easy to import typescript functions from the application source code

## npm packages and scripts

The following npm packages are used:

- `@fluencelabs/fluence` - is the client for Fluence Network running inside the browser. See https://github.com/fluencelabs/fluence-js for additional information
- `@fluencelabs/fluence-network-environment` - is the maintained list of Fluence networks and nodes to connect to.
- `@fluencelabs/aqua-cli` - is the command line interface for Aqua compiler. See https://github.com/fluencelabs/aqua for more information
- `@fluencelabs/aqua-lib` - Aqua language standard library
- `chokidar-cli` - A tool to watch for aqua file changes and compile them on the fly

The compilation of aqua code is implemented with these scripts:

```
scripts: {
...
    "compile-aqua": "aqua-cli -i ./aqua/ -o ./src/_aqua",
    "watch-aqua": "chokidar \"**/*.aqua\" -c \"npm run compile-aqua\""
}
...
```

The interface is pretty straightforward: you just specify the input and output directories for the compiler.

## Aqua code

## Application code
