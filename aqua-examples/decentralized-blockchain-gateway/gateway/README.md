# Aqua Ethereum Gateway

Gateway represents access to different Ethereum API providers (infura, alchemy). It can be used with Web3 client and load balancing requests between different providers.


## Installation

```shell
npm install -g @fluencelabs/aqua-eth-gateway
```

## Example

```shell
aqua-eth-gateway path/to/config.json
```

where config is:

```json
{
  "providers": [
    "https://goerli.infura.io/v3/your-api-key",
    "https://eth-goerli.g.alchemy.com/v2/your-api-key"
  ],
  "mode": "random",
  "relay": "fluence/peer/address",
  "serviceId": "eth-rpc serviceId",
  "port": 3000,
  "counterServiceId": null,
  "counterPeerId": null
}
```

`counterServiceId` and `counterPeerId` is credentials to counter service for `round-robin` mode. Will be used local counter if undefined.

## Mode

`random` - choose providers randomly
`round-robin` - choose providers in circle order
