import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './components/App';
import log from 'loglevel';

log.setLevel('error');

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root'),
);
