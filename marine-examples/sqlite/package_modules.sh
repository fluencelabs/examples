mkdir -p module-exports/modules/sqlite
sh ./build.sh

cd module-exports
cp ../artifacts/sqlite3.wasm modules/sqlite/

file="modules/sqlite/module.yaml"
cat > $file <<- EOF
version: 0
name: sqlite
loggerEnabled: true
EOF


tar -czvf sqlite.tar.gz  modules
rm -r modules
cd ../

cargo clean
