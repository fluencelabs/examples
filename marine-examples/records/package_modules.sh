
mkdir -p module-exports/modules/pure
mkdir -p module-exports/modules/effector

sh ./build.sh

cd module-exports
cp ../pure/target/wasm32-wasi/release/records_pure.wasm modules/pure/
cp ../effector/target/wasm32-wasi/release/records_effector.wasm modules/effector/

file="service.yaml"
cat > $file <<- EOF
version: 0
name: records
modules:
  pure:
    get: modules/pure
  effector:
    get: modules/effector
EOF


file="modules/pure/module.yaml"
cat > $file <<- EOF
version: 0
name: pure
loggerEnabled: true
EOF

file="modules/effector/module.yaml"
cat > $file <<- EOF
version: 0
name: effector
loggerEnabled: true
EOF

tar -czf records.tar.gz  modules service.yaml
rm -r modules
rm service.yaml

cd ../pure
cargo clean
pwd
cd ../effector
cargo clean
cd ..