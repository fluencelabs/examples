# Greeting

## Overview

This is a very simple service comprised of a single Wasm module, where the module only has one function, greeting. Fundamentally, this example illustrates how to build a function as a service (FaaS) for peer-to-peer deployment, with the exciting purpose of providing a hello world experience.

## Build

To build the example, please run the following command:

```
./build.sh
```

After the build is done, you get the module in the `artifacts` directory:

```
➜  greeting git:(main) ✗ ls artifacts
greeting.wasm
```

## Run

Test and inspect the example locally using the `mrepl` tool:

```
  greeting git:(main) mrepl Config.toml
Welcome to the Marine REPL (version 0.16.1)
Minimal supported versions
  sdk: 0.6.0
  interface-types: 0.20.0

app service was created with service id = 05251276-81fe-4dad-aea1-f35981077ec1
elapsed time 99.394571ms

1> i
Loaded modules interface:

greeting:
  fn greeting(name: string) -> string

2> call greeting greeting ["Mundo"]
result: String("Hi, Mundo")
 elapsed time: 123.176µs

3> q
➜  greeting git:(main)
```

Alternatively we can use `cargo test`:

```
➜  greeting git:(main) cargo +nightly test --release
 
 ....

    Finished release [optimized] target(s) in 10m 35s
     Running unittests src/main.rs (target/release/deps/greeting-35ba77ac6c6613e5)

running 2 tests
test tests::non_empty_string ... ok
test tests::empty_string ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.14s

➜  greeting git:(main)
```

For more detailed and in depth reading on the example please refer to the [Marine Examples Readme](../README.md#greeting-example)