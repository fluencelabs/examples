# Weighted Price Oracle With Fluence And Aqua


## About Fluence

Fluence provides an open Web3 protocol, framework and associated tooling to develop and host applications, interfaces and backends on permissionless peer-to-peer networks. An integral part of the Fluence solution is the Aquamarine stack comprised of Aqua and Marine. Aqua is a new programming language and paradigm purpose-built to program distributed networks and compose applications from distributed services. Marine is a general purpose Wasm runtime and toolkit, allows developers to build distributed services that can be composed into distributed applications by Aqua.

Fluence Developer Resources:

* [Developer Documentation](https://doc.fluence.dev/docs/)

Aqua Developer Resources:

* [Aqua Book](https://app.gitbook.com/@fluence/s/aqua-book/)
* [Aqua Playground](https://github.com/fluencelabs/aqua-playground)
* [Aqua repo](https://github.com/fluencelabs/aqua)

 Marine Developer Resources:

* [Marine repo](https://github.com/fluencelabs/marine)
* [Marine SDK](https://github.com/fluencelabs/marine-rs-sdk)


## Overview

Price (feed) oracles are probably the most used and in-demand oracle type and tend to have a significant impact on the success and profitability of DeFi and related on- and off-chain operations. In this example, we demonstrate how to create a decentralized, off-chain price (feed) oracle on the Fluence peer-to-peer network from a set of distributed, re-usable Marine services composed by Aqua and use TrustGraph for peer prioritization.

Figure 1: Stylized Price Oracle Network And Service Process
// TODO: insert diagram

As outlined in Figure 1, we use one or more services distributed across the Fluence peer-to-peer network to obtain price quotes from sources. For example, we could have one service capable of querying one or more sources such as DEX contracts deployed on multiple network peers allowing us to poll price sources in parallel. We then join these results and submit them to a processing service also deployed on the peer-to-peer network to establish, for example, an oracle point-estimate. Once we've obtained our oracle, we return it to the peer-client, e.g., a browser.

## Quick Start

Look at [client-peer](./client-peer) directory for a peer-client based on the Fluence JS-SDK. To run the headless client:

```bash
% cd client-peer
% npm instal
% npm start run
```

which gives us:

```text
# <snip>
hello crypto investors
created a fluence client 12D3KooWEKui98wfChxaPou6qcNcH5zY3LzfXRwJbTViKUdY7aWi with relay 12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi
// TODO: add smth about trusts chain and weights
get_weighted_price result:  { error_msg: '', result: 3989.19, success: true }
```

where the Aqua script can be found in the `aqua-scripts` directory and the compiled Aqua code is found in the `get_crypto_prices.ts` file. For more on the Aqua script, see below.

## Service Development And Deployment

**Prerequisites:** If you want to follow along, compile Wasm modules, create services and deploy service, you need Rust, Node and a few Fluence tools installed. Please see follow the [Setup](https://doc.fluence.dev/docs/tutorials_tutorials/recipes_setting_up) instructions.

Applications are composed from one or more services available on one or more Fluence peer-to-peer nodes. Services are comprised of one or more Wasm modules providing a wide range of compute functionality and access to persistance, e.g. IPFS and SQLite. For the purpose of our objective, we need a service that can call on some API to source price quotes. In an ideal, production world, this would be calling on a large set of DEX contacts to obtain price pairs and, say, lquidity, over a particular window of time. For our purposes, we simplify the process and call on the [Coingecko API](https://www.coingecko.com/api/documentations/v3) and add a random jitter to each quote retrieved to give us some variance.

For implementation details, see [price_getter_service]("./../price_getter_service/src/main.rs), which compiles to our desired wasm32-wasi target. Since Wasm modules don't have sockets but we need to use cUrl, which is provided by the host node. In order to do that, we fist need to write an adapter that allows us to access the cUrl service from a Wasm module and then link that service to our price_getter service. See [cUrl adapter example](./marine-scripts/curl_adapter) for more details on the implementation of our [curl adapter service](./curl_adapter/src/main.rs).

Figure 3: Stylized Service Creation By Marine Module Linking

<img src="images/figure_2.png " width="400" />

As seen in Figure 3, we link the price_getter module and curl adapter module into a price_getter service ready for deployment to the Fluence peer-to-peer network. Before we proceed, we have one more service to consider: the price quote processing service which yields the oracle. Again, we simplified what could be an extensive processing algorithm into a simple weighted mean calculation, see [weighted_mean_service]("./../weighted_mean_service/src/main.rs") for implementation details. Unlike the price getter service, weighted mean service is a simple, FaaS compute module that deploys on any number of network peers.

For peer prioritization we will use built-in TrustGraph service. TODO: smth about weights

We now have our code in place and area ready to compile and our compilation instructions are contain in the `scripts/build.sh` script, which basically instructs the the code is compiled with `marine` and that the resulting Wasm modules are copied to the `artifacts` directory. In the project directory:

```bash
./scripts/build.sh
```

which gives you the updated Wasm modules in the `artifacts` directory.

The next step is to deploy the two services to one or more peers and we use the `fldist` tool to get this done. First, we need to now what peers are available and we can get an enumeration from:

```bash
fldist env
```

*Please note that multiple service instances have been already deployed and the (peer id, service id) tuples can be found in [data]("./data/deployed_services.json) json file. While your more than welcome to deploy your services, you don't have to in order to use them.*

Pick any of the peer ids from the listed peers to deploy your services. Let's say we use peer id `12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi`:

```bash
$ fldist --node-id 12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi new_service --ms artifacts/curl_adapter.wasm:configs/curl_adapter_cfg.json artifacts/price_getter_service.wasm:configs/price_getter_service_cfg.json --name price-getter-service-0
service id: f5b456fa-ee18-4df1-b18b-84fe7ebc7ad0    # <--- REMEMBER service id !!
service created successfully
```

to deploy a price-getter service and

```bash
$ fldist --node-id 12D3KooWFEwNWcHqi9rtsmDhsYcDbRUCDXH84RC4FW6UfsFWaoHi  new_service --ms artifacts/weighted_mean_service.wasm:configs/weighted_mean_service_cfg.json  --name weighted_mean-service-0
service id: debecd02-ba7d-40a2-92ab-08a9321da2cf    # <--- REMEMBER service id !!
service created successfully
```

to deploy a weighted mean service. Please take note of the service-id you get back for each fo the deployments, which are needed to locate the service in the future.

That's it for service development and deployment!

## Application Composition with Aqua

Aqua allows us to compose distributed services into decentralized applications such as our price oracle app. However, Aqua permits a great degree of freedom of *how* to compose services. As Aqua combines [Layer 3 and Layer 7](https://en.wikipedia.org/wiki/OSI_model) programming, i.e., network  and application programming, respectively, Aqua allows us to specify parallel or sequential workflows in response to service availability and deployment.

With just a few lines of code, we can program the network and application layers to compose hose peer-to-peer services into powerful decentralized applications, look at the `get_weighted_price` function:

```aqua
-- aqua-scripts/get_crypto_prices.aqua

data NodeServicePair:
    node: string
    service_id: string

func get_weighted_price(coin: string, currency: string, getter_topo: []NodeServicePair, mean_topo: NodeServicePair) -> Result:
  prices: *f64
  weights: *u32
  for topo <- getter_topo:                                              --< For each instance of the getter topology
    on topo.node:                                                       --< On each specified node
      PriceGetterService topo.service_id                                --< And service id
      ts_ms <- Peer.timestamp_ms()
      res <- PriceGetterService.price_getter(coin, currency, ts_ms)     --< Run the price getter service to obtain a quote
      prices <- F64Op.identity(res.result)

  on HOST_PEER_ID:                                                      --< On our relay
    for topo <- getter_topo:                                            --< For each instance of the getter topology
      res <- get_weight(topo.node)                                      --< Obtain subjective weight of each node in trust graph
      weights <- U32Op.identity(res.weight)

  on mean_topo.node:                                                    --< After loops, create the Mean service binding on the specified node
    WeightedMeanService mean_topo.service_id
result <- WeightedMeanService.weighted_mean(prices, weights)            --< Process the price quote array
  <- result                                                             --<  Return the result to the client peer
```

To compile our Aqua script, we use the `aqua` tool and either compile our code to raw Air:

```text
% aqua -i aqua-scripts -o air-scripts -a
```

or to a ready-made typescript stub:

```text
% aqua -i aqua-scripts -o air-scripts
```

## Summary

We illustrated how to create decentralized weighted price oracle application with Aqua and the Fluence stack with different peers and use TrustGraph for prioritization.
