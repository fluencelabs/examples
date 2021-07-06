# Download & return URL via curl

An example to kick-off building services on Fluence.

What it does:
- exploits `mounted_binaries` to call `/usr/bin/curl` on the host OS
- downloads any url, and returns its content as a resulting `String`

# BackendConfig.json
Wasm module is configured with this simple [JSON config](backend/BackendConfig.json):
```json5
{
  // import name of the module; needed when linking modules in multi-module setups
  "name": "curl_adapter",
  // binaries available to call
  "mountedBinaries":
    {
      // curl will be callable as a host function
      "curl": "/usr/bin/curl"
    }
}
```
P.S. JSON5 has comments! yaaay!

# Build & deploy it
```shell
./deploy.sh
```

# Call it
```shell
fldist run_air -p request.air -d '{"service": "19e70712-04b6-496e-96d9-9eab87bef9c6"}'
```

# Run frontend
```shell
cd frontend
npm i
npm start
```
