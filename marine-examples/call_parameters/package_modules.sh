
mkdir -p module-exports/modules/call_parameters
sh ./build.sh

cd module-exports
cp ../target/wasm32-wasi/release/call_parameters.wasm modules/call_parameters/
file="modules/call_parameters/module.yaml"
cat > $file <<- EOF
version: 0
name: call_parameters
loggerEnabled: true
EOF

tar -czf call_parameters.tar.gz  modules
rm -r modules

cd ../
cargo clean