# Ether Price Quotation Service

## Overview
This module utilizes curl and the [Coinmarketcap API](https://coinmarketcap.com/api/) to allow the query of the latest Ether (ETH) price relative to some 120 currencies. The service requires a valid Coinmarketcap API key, which is freely available with [registration](https://pro.coinmarketcap.com/signup/). The query function wraps this API call: https://coinmarketcap.com/api/documentation/v1/#operation/getV2CryptocurrencyQuotesLatest:

```bash
ether_price_getter(api_key: String, currency_symbol: String)
```

which expects the [Coinmarketcap API key] and the three letter currency symbol, e.g.:

```
call ether_price_getter ether_price_getter  ["32fd4c0f-59cf-4182-8f22-d4083df0a738", "EUR"]
```

Please note that you need to supply a valid Coinmarketcap API key and that the free account limits the
number of conversions to one. The result from the Fluence service call is the raw json string, e.g.:

```
result: String("{\"status\":{\"timestamp\":\"2021-02-22T20:47:59.960Z\",\"error_code\":0,\"error_message\":null,\"elapsed\":225,\"credit_count\":1,\"notice\":null},\"data\":{\"ETH\":{\"id\":1027,\"name\":\"Ethereum\",\"symbol\":\"ETH\",\"slug\":\"ethereum\",\"num_market_pairs\":5986,\"date_added\":\"2015-08-07T00:00:00.000Z\",\"tags\":[\"mineable\",\"pow\",\"smart-contracts\",\"coinbase-ventures-portfolio\",\"three-arrows-capital-portfolio\",\"polychain-capital-portfolio\"],\"max_supply\":null,\"circulating_supply\":114779907.124,\"total_supply\":114779907.124,\"is_active\":1,\"platform\":null,\"cmc_rank\":2,\"is_fiat\":0,\"last_updated\":\"2021-02-22T20:46:06.000Z\",\"quote\":{\"EUR\":{\"price\":1464.4187545109621,\"volume_24h\":34069036322.326084,\"percent_change_1h\":3.41360427,\"percent_change_24h\":-10.32669439,\"percent_change_7d\":-3.70439114,\"percent_change_30d\":41.39754247,\"market_cap\":168085848633.412,\"last_updated\":\"2021-02-22T20:47:05.000Z\"}}}}}")
```

## Where to Find The Service
The service is discoverable at [Fluence](https://dash.fluence.dev/), e.g., https://dash.fluence.dev/blueprint/a7959f53-a70b-4183-83e0-649f4f91160c, and ready for use.

## How to Build The Service
machine setup instructions

In the `eth-price-getter` dir, 
```bash
# if needed
chmod +x .build.sh

./build.sh
```

That compiles both the curl and the price getter code and places the resulting wasm code into the `artifacts` dir. For local testing run `fce-repl Config.toml` to initiate the repl:

```bash
fce-repl Config.toml
Welcome to the FCE REPL (version 0.1.33)
app service was created with service id = b0cc4d0d-fb3e-49e1-8532-54d77e03cdaa
elapsed time 82.757883ms

1> interface
Loaded modules interface:

curl_adapter:
  fn curl_request(url: String) -> String

ether_price_getter:
  fn ether_price_getter(api_key: String, currency_symbol: String) -> String

2> call ether_price_getter ether_price_getter ["35fd4b0e-56cf-4182-8f22-d4095cf0a738", "EUR"]
INFO: Running "/usr/bin/curl -H X-CMC_PRO_API_KEY: 35fd4b0e-56cf-4182-8f22-d4095cf0a738 -H Accept: application/json -d symbol=ETH&convert=EUR -G https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest" ...
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   868    0   868    0     0   2755      0 --:--:-- --:--:-- --:--:--  2755
result: String("{\"status\":{\"timestamp\":\"2021-02-22T21:06:42.598Z\",\"error_code\":0,\"error_message\":null,\"elapsed\":18,\"credit_count\":1,\"notice\":null},\"data\":{\"ETH\":{\"id\":1027,\"name\":\"Ethereum\",\"symbol\":\"ETH\",\"slug\":\"ethereum\",\"num_market_pairs\":5986,\"date_added\":\"2015-08-07T00:00:00.000Z\",\"tags\":[\"mineable\",\"pow\",\"smart-contracts\",\"coinbase-ventures-portfolio\",\"three-arrows-capital-portfolio\",\"polychain-capital-portfolio\"],\"max_supply\":null,\"circulating_supply\":114779907.124,\"total_supply\":114779907.124,\"is_active\":1,\"platform\":null,\"cmc_rank\":2,\"is_fiat\":0,\"last_updated\":\"2021-02-22T21:05:03.000Z\",\"quote\":{\"EUR\":{\"price\":1459.5551152082585,\"volume_24h\":33903071552.817226,\"percent_change_1h\":2.64386327,\"percent_change_24h\":-10.46990835,\"percent_change_7d\":-4.37412016,\"percent_change_30d\":41.26794407,\"market_cap\":167527600565.963,\"last_updated\":\"2021-02-22T21:06:05.000Z\"}}}}}")
 elapsed time: 323.584665ms

3>
```

Calling `interface` lists both the curl_adapter and ether_price_getter interfaces. Calling the `ether_price_getter` service function with the API key and conversion currency symbol, `"35fd4b0e-56cf-4182-8f22-d4095cf0a738", "EUR"`, yields the raw json string result expected.

## How to Deploy The Service
ToDo: fldist installation instructions


If you don't have a seed ready to use:

```bash
fldist create_keypair
{
  id: '12D3KooWQy61BZ4P1DeJzhvsQ76uQAQc7N8tDk6NDz5BFnnhwuPP',
  privKey: 'CAESYI9nA79xXH9yYeuU4UDPiaa7C84U0OKnihdSkSdbMOIV4RtA5l9dooR41cO8lCz3okYpEboK6maL7yk1ABgCvrLhG0DmX12ihHjVw7yULPeiRikRugrqZovvKTUAGAK+sg==',
  pubKey: 'CAESIOEbQOZfXaKEeNXDvJQs96JGKRG6Cupmi+8pNQAYAr6y',
  seed: 'AenQdfKCRrh1sajNFkKKV1iojgVnLWyatdaqwzEMopje'
}
```

which yields a fresh keypair and derived seed and allows us to create a new service. The `fldist new_service` is a convenience method that takes care the module uploads to the node, the creation of the blueprint, and finally, the instantiation of the services.

```bash
fldist new_service --env testnet -n "Ether Price Getter" -s AenQdfKCRrh1sajNFkKKV1iojgVnLWyatdaqwzEMopje --ms artifacts/curl_adapter.wasm:curl_cfg.json artifacts/ether_price_getter.wasm:ether_price_getter_cfg.json
```

specifies that we are creating a new service comprised of two modules, the curl_adapter module and the ether_price_getter module, and generates the confirmation with service id:

```bash
client seed: AenQdfKCRrh1sajNFkKKV1iojgVnLWyatdaqwzEMopje
client peerId: 12D3KooWQy61BZ4P1DeJzhvsQ76uQAQc7N8tDk6NDz5BFnnhwuPP
node peerId: 12D3KooWBUJifCTgaxAUrcM9JysqCcS4CS8tiYH5hExbdWCAoNwb
uploading blueprint Ether Price Getter to node 12D3KooWBUJifCTgaxAUrcM9JysqCcS4CS8tiYH5hExbdWCAoNwb via client 12D3KooWQy61BZ4P1DeJzhvsQ76uQAQc7N8tDk6NDz5BFnnhwuPP
creating service a7959f53-a70b-4183-83e0-649f4f91160c
service id: 9840c6be-11c8-47e2-98e0-88d758b5a456
service created successfully
```

We can now discover the service on the [Fluence dashboard](https://dash.fluence.dev/blueprint/a7959f53-a70b-4183-83e0-649f4f91160c) and put it to use. Whether we want to write a frontend application or use the `fldist` tool to execute the remote service, we need an AIR script. Using the prepared [AIR script](../air-scripts/get_eth_price.js) for which you need to supply your own API key:

```bash
fldist run_air  -p get_eth_price.clj -d '{"service":"9840c6be-11c8-47e2-98e0-88d758b5a456"}'

client seed: 6w6j5yiPU7pMj86XSoLwesoSxhM2fzNNKF6DDtqm3WCH
client peerId: 12D3KooWAwwuy9mz1w14JhznVo1cA4UKtvVv1Gy4EKRywVRwKQ1w
node peerId: 12D3KooWBUJifCTgaxAUrcM9JysqCcS4CS8tiYH5hExbdWCAoNwb
Particle id: 9eb6c275-8f1a-4bae-b457-747546b3daaf. Waiting for results... Press Ctrl+C to stop the script.
===================
[
  "{\"status\":{\"timestamp\":\"2021-02-24T07:11:26.493Z\",\"error_code\":0,\"error_message\":null,\"elapsed\":14,\"credit_count\":1,\"notice\":null},\"data\":{\"ETH\":{\"id\":1027,\"name\":\"Ethereum\",\"symbol\":\"ETH\",\"slug\":\"ethereum\",\"num_market_pairs\":6018,\"date_added\":\"2015-08-07T00:00:00.000Z\",\"tags\":[\"mineable\",\"pow\",\"smart-contracts\",\"coinbase-ventures-portfolio\",\"three-arrows-capital-portfolio\",\"polychain-capital-portfolio\"],\"max_supply\":null,\"circulating_supply\":114799158.0615,\"total_supply\":114799158.0615,\"is_active\":1,\"platform\":null,\"cmc_rank\":2,\"is_fiat\":0,\"last_updated\":\"2021-02-24T07:10:03.000Z\",\"quote\":{\"EUR\":{\"price\":1338.6331723430615,\"volume_24h\":40823704838.16298,\"percent_change_1h\":-1.44088165,\"percent_change_24h\":-0.24837544,\"percent_change_7d\":-8.52364557,\"percent_change_30d\":13.62330192,\"market_cap\":153673961138.17825,\"last_updated\":\"2021-02-24T07:11:06.000Z\"}}}}}"
]
[
  [
    {
      peer_pk: '12D3KooWBUJifCTgaxAUrcM9JysqCcS4CS8tiYH5hExbdWCAoNwb',
      service_id: '9840c6be-11c8-47e2-98e0-88d758b5a456',
      function_name: 'ether_price_getter',
      json_path: ''
    }
  ]
]
===================
```

yields the expected raw pricing response. Please note that with the free account, only one currency conversion target can be supplied per query.
