import Web3 from 'web3';

const web3 = new Web3("http://localhost:3000");

async function main() {
    const bn = await web3.eth.getBlockNumber()
    console.log(bn)

    const resp = await web3.eth.getTransaction("0x8bad403edde37642e4dab6c91eeca77b979fce1c979c14ca8755f5c3573eaeb4")
    console.log(resp)
}

main();

