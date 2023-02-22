mkdir -p module-exports/modules/greeting
sh ./build.sh

cd module-exports
cp ../target/wasm32-wasi/release/greeting.wasm modules/greeting/

file="modules/greeting/module.yaml"
cat > $file <<- EOF
version: 0
name: local_storage
loggerEnabled: true
EOF


tar -czvf greeting.tar.gz  modules
rm -r modules
cd ../

cargo clean
