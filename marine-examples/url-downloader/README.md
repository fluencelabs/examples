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
     -i download_url.aqua -f'download("https://fluence.network/img/svg/logo_new.svg", "logo.svg", "12D3KooWDUszU2NeWyUVjCXhGEt1MoZrhvdmaQQwtZUriuGN1jTr", "e693d1c3-3fbc-4ccd-8eae-1ba9c767e2f5")'
```
