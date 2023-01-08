# Build wasm
```shell
marine build --release
```

# Run tests
```shell
./test.sh
```

## Gives error
```
   Compiling eth-rpc v0.1.0 (/Users/folex/Development/fluencelabs/examples/aqua-examples/decentralized-blockchain-gateway/wasm-modules/eth-rpc)
    Finished release [optimized] target(s) in 1m 12s
    Starting 1 tests across 1 binaries
       START             eth-rpc::bin/eth-rpc tests::dummy

running 1 test
thread 'tests::dummy' panicked at 'app service can't be created: engine error: Wasmer error: 4 link errors: (1 of 4) Import not found, namespace: __wbindgen_placeholder__, name: __wbindgen_describe (2 of 4) Import not found, namespace: __wbindgen_placeholder__, name: __wbindgen_throw (3 of 4) Import not found, namespace: __wbindgen_externref_xform__, name: __wbindgen_externref_table_grow (4 of 4) Import not found, namespace: __wbindgen_externref_xform__, name: __wbindgen_externref_table_set_null', src/main.rs:63:5
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
test tests::dummy ... FAILED

failures:

failures:
    tests::dummy

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.09s

        FAIL [   0.097s] eth-rpc::bin/eth-rpc tests::dummy
------------
     Summary [   0.099s] 1 tests run: 0 passed, 1 failed, 0 skipped
        FAIL [   0.097s] eth-rpc::bin/eth-rpc tests::dummy
error: test run failed

Process finished with exit code 100
```