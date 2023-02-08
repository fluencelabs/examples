mkdir -p service-packages/modules/eth_rpc
mkdir -p service-packages/modules/ipfs_adapter
mkdir -p service-packages/modules/ipfs_cli
mkdir -p service-packages/modules/multi_provider_query
mkdir -p service-packages/modules/simple_quorum
mkdir -p service-packages/modules/utilities
mkdir -p service-packages/modules/curl_adapter
# sh ./scripts/build.sh

cd  service-packages

# create eth-rpc service package
cp ../configs/services/eth-rpc/service.yaml .
cp ../artifacts/eth_rpc.wasm modules/eth_rpc/
cp ../wasm-modules/eth-rpc/module.yaml modules/eth_rpc/
cp ../artifacts/curl_adapter.wasm modules/curl_adapter/
cp ../wasm-modules/curl-adapter/module.yaml modules/curl_adapter
tar -czf eth_rpc.tar.gz  modules/eth_rpc modules/curl_adapter service.yaml 
rm service.yaml

# create ipfs-package service package
cp ../configs/services/ipfs-package/service.yaml .
cp ../artifacts/ipfs_cli.wasm modules/ipfs_cli/
cp ../wasm-modules/ipfs-cli/module.yaml modules/ipfs_cli/
cp ../artifacts/ipfs_adapter.wasm modules/ipfs_adapter/
cp ../wasm-modules/ipfs-adapter/module.yaml modules/ipfs_adapter
tar -czf ipfs_package.tar.gz  modules/ipfs_cli modules/ipfs_adapter service.yaml 
rm service.yaml

# create multi-provider-query service package
cp ../configs/services/multi-provider-query/service.yaml .
cp ../artifacts/multi_provider_query.wasm modules/multi_provider_query/
cp ../wasm-modules/multi-provider-query/module.yaml modules/multi_provider_query/
tar -czf multi_provider_query_package.tar.gz  modules/ipfs_cli modules/curl_adapter service.yaml 
rm service.yaml

# create simple-quorum service package
cp ../configs/services/simple-quorum/service.yaml .
cp ../artifacts/simple_quorum.wasm modules/simple_quorum/
cp ../wasm-modules/simple-quorum/module.yaml modules/simple_quorum/
tar -czf simple_quorum_package.tar.gz service.yaml 
rm service.yaml

# create utility service package
cp ../configs/services/utilities/service.yaml .
cp ../artifacts/utilities.wasm modules/utilities/
cp ../wasm-modules/utilities/module.yaml modules/utilities/
tar -czf utilities_package.tar.gz service.yaml 
rm service.yaml

rm -r modules
cd ../