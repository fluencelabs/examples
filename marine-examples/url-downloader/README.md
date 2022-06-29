# Download file to disk

Example that shows how to work with disk access and how to link several Wasm modules into a service.

# Build & deploy it

```shell
./deploy.sh
```

# Call it

```shell
aqua run \
     --addr /dns4/kras-06.fluence.dev/tcp/19001/wss/p2p/12D3KooWDUszU2NeWyUVjCXhGEt1MoZrhvdmaQQwtZUriuGN1jTr  \
     -i download_url.aqua \
     -f'download("https://fluence.network/img/svg/logo_new.svg", "logo.svg", "<your-service-peer-id>", "<your-service-id>")'
```
Please note that the `<your-service-peer-id>` is a peer where you deployed your service to using the `deploy.sh` script and the `<your-service-id>` is one you get after successfully deploying you service on the peer, e.g.:

```
...
Now time to make a blueprint...
Blueprint id:
d0a0c3cff0b371f833918ceb7dccbb8e38e3847bc7bf5d35a0e730f24568e13e
And your service id is:
"46477b20-c061-46ea-89bc-25906ad543d6"
```

For more in depth reading on the example please refer to the [Marine Examples Readme](../README.md)