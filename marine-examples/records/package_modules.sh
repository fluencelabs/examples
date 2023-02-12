
mkdir -p module-exports/modules/facade
mkdir -p module-exports/modules/pure

sh ./build.sh

cd module-exports
cp ../facade/target/wasm32-wasi/release/records_facade.wasm modules/facade/
cp ../pure/target/wasm32-wasi/release/records_pure.wasm modules/pure/

file="service.yaml"
cat > $file <<- EOF
version: 0
name: records
modules:
  pure:
    get: modules/facade
  effector:
    get: modules/pure
EOF


file="modules/facade/module.yaml"
cat > $file <<- EOF
version: 0
name: facade
loggerEnabled: true
EOF

file="modules/pure/module.yaml"
cat > $file <<- EOF
version: 0
name: pure
loggerEnabled: true
EOF

tar -czf records.tar.gz  modules service.yaml
rm -r modules
rm service.yaml

cd ../facade
cargo clean
pwd
cd ../pure
cargo clean
