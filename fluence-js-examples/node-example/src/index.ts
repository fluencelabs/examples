import { runServer, waitForKeypressAndStop } from './main';

runServer().then(waitForKeypressAndStop);
