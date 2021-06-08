
Checked build:
```
./build.sh;
```

Upload binary:
```
fldist upload --path artifacts/math256.wasm --name math256
```

Create blueprint:
```
fldist add_blueprint --deps math256 --name math256
```

Allow service:
```
fldist create_service --id $BLUEPRINT_ID
```

Smoke test deployed service:
```
fldist run_air --path ./scripts/math.clj --data "{\"service_id\":\"$SERVICE_ID\",\"a\":\"13\", \"b\":\"42\"}" -v --ttl 5000
```

Fail add:
```
fldist run_air --path ./scripts/math.clj --data "{\"service_id\":\"$SERVICE_ID\",\"a\":\"999999999999999999999999999999999999999999999999999999999999999999999999999999\", \"b\":\"0\"}" -v --ttl 5000
```


To generate script from Aqua:
```
aqua-cli --input ./scripts/math.aqua --output ./scripts --air
```

Interactive run from REPL:
```
mrepl Config.toml 
```

and then `call math256 add ["1"  "2"]`
