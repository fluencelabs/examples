import { krasnodar, stage, testNet, Node } from '@fluencelabs/fluence-network-environment';
import { main } from './main';

let args = process.argv.slice(2);
var environment: Node[];
if (args.length >= 1 && args[0] == 'testnet') {
    environment = testNet;
    console.log('📘 Will connect to testNet');
} else if (args[0] == 'stage') {
    environment = stage;
    console.log('📘 Will connect to stage');
} else if (args[0] == 'krasnodar') {
    environment = krasnodar;
    console.log('📘 Will connect to krasnodar');
} else if (args[0] == 'testnet') {
    environment = testNet;
    console.log('📘 Will connect to testNet');
} else {
    throw 'Specify environment';
}

main(environment)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
