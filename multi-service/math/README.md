
Check:
```
./build.sh; cargo test --release; 
```

Deploy:
```
fldist upload --path artifacts/math.wasm --name math --env FLUENCE_ENV
```