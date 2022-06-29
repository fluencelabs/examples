# Multiservice Marine Test

## Overview

This example illustrates another ability of the `marine_test` macro: testing several services at once. To show that we will create couple of services: a producer service which will create some data, and a consumer service which will process the data. Then test it ensuring that the consumer properly processed data from the producer.

## Build

To build the example, please run the following command:

```
./build.sh
```

Upon a successful build it results a couple of wasm modules of the producer and consumer in the respective directories:

```
➜  multiservice_marine_test git:(main) ✗ ls producer/artifacts
producer.wasm
➜  multiservice_marine_test git:(main) ✗ ls consumer/artifacts
consumer.wasm
```

## Run

One of the ways to run the tests is:

> Please make sure you're using a nightly toolchain using `rustup show`.
> If not, please do that with the `rustup override set nightly` for the current directory.

```
cargo test
```

Upon successful run it results the following:

```
   Finished test [unoptimized + debuginfo] target(s) in 3m 05s
     Running unittests src/main.rs (target/debug/deps/multiservice_marine_test-20dd18fbb0e3ed6d)

running 2 tests
test tests_on_mod::test ... ok
test tests::test ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 32.87s

```

We can also use the `mrepl` tool to test the service.

To use a producer, please run `mrepl` in the `producer` directory:

```
➜  multiservice_marine_test git:(main) ✗ cd producer
➜  producer git:(main) ✗ mrepl Config.toml
Welcome to the Marine REPL (version 0.16.1)
Minimal supported versions
  sdk: 0.6.0
  interface-types: 0.20.0

app service was created with service id = 9e26fb88-2e71-411a-8eed-fa2b92fbffaf
elapsed time 232.38238ms

1> i
Loaded modules interface:
data Data:
  name: string
data Input:
  first_name: string
  last_name: string

producer:
  fn produce(data: Input) -> Data

2> call producer produce [{"first_name": "John", "last_name": "Doe"}]
result: Object({"name": String("John Doe")})
 elapsed time: 11.131695ms

3> q
```

To use a consumer, please run `mrepl` in the `consumer` directory:

```
➜  multiservice_marine_test git:(main) ✗ cd consumer
➜  consumer git:(main) ✗ mrepl Config.toml
Welcome to the Marine REPL (version 0.16.1)
Minimal supported versions
  sdk: 0.6.0
  interface-types: 0.20.0

app service was created with service id = 63df6150-3aee-4b10-b5ee-80bbbfa293ad
elapsed time 97.517844ms

1> i
Loaded modules interface:
data Data:
  name: string

consumer:
  fn consume(data: Data) -> string

2> call consumer consume [{"name": "John Doe"}]
result: String("John Doe")
 elapsed time: 515.931µs

3> q
➜  consumer git:(multiservice-marine-test-fix) ✗
```

For more detailed and in depth reading on the example please refer to the [Marine Examples Readme](../README.md#multiservice-marine-test-example)