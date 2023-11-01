import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.scss';

import { Fluence, kras, randomKras } from '@fluencelabs/js-client';
import { getRelayTime } from './_aqua/getting-started';
// TODO: Hack to extract ConnectionState type from js-client. In the next version this type will be exported from the package.
type ConnectionState = Parameters<Parameters<(typeof Fluence)['onConnectionStateChange']>[0]>[0];

const relayNode = kras[0];

function App() {
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [relayTime, setRelayTime] = useState<Date | null>(null);

    useEffect(() => {
        setConnectionState('connecting');
        Fluence.connect(randomKras()).then(() => {
            setConnectionState('connected');
        });
    }, []);

    const onGetRelayTimeBtnClick = async () => {
        if (connectionState !== 'connected') {
            return;
        }
        const time = await getRelayTime(relayNode.peerId);
        setRelayTime(new Date(time));
    };

    return (
        <div className="App">
            <header>
                <img src={logo} className="logo" alt="logo" />
            </header>

            <div className="content">
                <h1>
                    Connection state: <span id="status">{connectionState}</span>
                </h1>
                <button
                    id="btn"
                    className="btn"
                    onClick={onGetRelayTimeBtnClick}
                    disabled={connectionState !== 'connected'}
                >
                    Get relay time
                </button>
                {relayTime && (
                    <>
                        <h2>Relay time:</h2>
                        <div id="relayTime">{relayTime?.toLocaleString() || ''}</div>
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
