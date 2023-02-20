import { runServer, waitForKeypressAndStop } from './main.js';

runServer()
    .then(waitForKeypressAndStop)
    .catch((e) => console.error('error: ', e));
