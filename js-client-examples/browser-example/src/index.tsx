import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { Fluence } from '@fluencelabs/js-client.api';
import { randomKras } from '@fluencelabs/fluence-network-environment';

const relayNode = randomKras();

Fluence.connect(relayNode);

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root'),
);
