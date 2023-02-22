
mkdir -p module-exports/modules/curl_adapter
mkdir -p module-exports/modules/facade
mkdir -p module-exports/modules/local_storage
sh ./build.sh

cd module-exports
cp ../curl_adapter/target/wasm32-wasi/release/curl_adapter.wasm modules/curl_adapter/
cp ../facade/target/wasm32-wasi/release/facade.wasm modules/facade/
cp ../local_storage/target/wasm32-wasi/release/local_storage.wasm modules/local_storage/

file="service.yaml"
cat > $file <<- EOF
version: 0
name: urlDownloader
modules:
  facade:
    get: modules/facade
  localStorage:
    get: modules/local_storage
  curlAdapter:
    get: modules/curl_adapter
EOF


file="modules/curl_adapter/module.yaml"
cat > $file <<- EOF
version: 0
name: curl_adapter
loggerEnabled: true
mountedBinaries:
  curl: /usr/bin/curl
EOF

file="modules/local_storage/module.yaml"
cat > $file <<- EOF
version: 0
name: local_storage
loggerEnabled: true
volumes:
  sites: ./tmp
EOF

file="modules/facade/module.yaml"
cat > $file <<- EOF
version: 0
name: facade
loggerEnabled: true
EOF


tar -czf url_downloader.tar.gz  modules service.yaml
rm -r modules
rm service.yaml

cd ../facade
cargo clean
pwd
cd ../curl_adapter
cargo clean
cd ../local_storage
cargo clean
