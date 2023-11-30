import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.scss';

import { Fluence, type ConnectionState } from '@fluencelabs/js-client';
import { sayHello, registerHelloPeer } from './compiled-aqua/getting-started';
import relays from './relays.json';

const relayNodes = [relays[0], relays[1], relays[2]];

function App() {
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [peerInfo, setPeerInfo] = useState<{ peerId: string; relayPeerId: string } | null>(null);
    const [helloMessage, setHelloMessage] = useState<string | null>(null);

    const [peerIdInput, setPeerIdInput] = useState<string>('');
    const [relayPeerIdInput, setRelayPeerIdInput] = useState<string>('');

    useEffect(() => {
        if (connectionState === 'connected') {
            const client = Fluence.getClient();

            const peerId = client.getPeerId();
            const relayPeerId = client.getRelayPeerId();
            setPeerInfo({ peerId, relayPeerId });
        }
    }, [connectionState]);

    const connect = async (relayPeerId: string) => {
        try {
            setConnectionState('connecting');
            await Fluence.connect(relayPeerId);
            setConnectionState('connected');

            // Register handler for this call in aqua:
            // HelloPeer.hello(%init_peer_id%)
            registerHelloPeer({
                hello: (from) => {
                    setHelloMessage('Hello from: \n' + from);
                    return 'Hello back to you, \n' + from;
                },
            });
        } catch (err) {
            console.log('Client could not connect', err);
        }
    };

    const helloBtnOnClick = async () => {
        if (connectionState !== 'connected') {
            return;
        }

        // Using aqua is as easy as calling a javascript function
        const res = await sayHello(peerIdInput, relayPeerIdInput);
        setHelloMessage(res);
    };

    const isConnected = connectionState === 'connected';

    return (
        <div className="App">
            <header>
                <img src={logo} className="logo" alt="logo" />
            </header>

            <div className="content">
                <h1>{connectionState}</h1>
                {isConnected ? (
                    <>
                        <table>
                            <tbody>
                                <tr>
                                    <td className="bold">Peer id:</td>
                                    <td className="mono">
                                        <span id="peerId">{peerInfo?.peerId}</span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-clipboard"
                                            onClick={() => copyToClipboard(peerInfo?.peerId)}
                                        >
                                            <i className="gg-clipboard"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="bold">Relay peer id:</td>
                                    <td className="mono">
                                        <span id="relayId">{peerInfo?.relayPeerId}</span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-clipboard"
                                            onClick={() => copyToClipboard(peerInfo?.relayPeerId)}
                                        >
                                            <i className="gg-clipboard"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div>
                            <h2>Say hello!</h2>
                            <p className="p">
                                Now try opening a new tab with the same application. Copy paste the peer id and relay
                                from the second tab and say hello!
                            </p>
                            <div className="row">
                                <label className="label bold">Target peer id</label>
                                <input
                                    id="targetPeerId"
                                    className="input"
                                    type="text"
                                    onChange={(e) => setPeerIdInput(e.target.value)}
                                    value={peerIdInput}
                                />
                            </div>
                            <div className="row">
                                <label className="label bold">Target relay</label>
                                <input
                                    id="targetRelayId"
                                    className="input"
                                    type="text"
                                    onChange={(e) => setRelayPeerIdInput(e.target.value)}
                                    value={relayPeerIdInput}
                                />
                            </div>
                            <div className="row">
                                <button className="btn btn-hello" onClick={helloBtnOnClick}>
                                    say hello
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <h1>Intro 1: P2P browser-to-browser</h1>
                        <h2>Pick a relay</h2>
                        <ul>
                            {relayNodes.map((x) => (
                                <li key={x.peerId}>
                                    <span className="mono">{x.peerId}</span>
                                    <button className="btn" onClick={() => connect(x.multiaddr)}>
                                        Connect
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {helloMessage && (
                    <>
                        <h2>Message</h2>
                        <div id="message"> {helloMessage} </div>
                    </>
                )}
            </div>
        </div>
    );
}

const copyToClipboard = (text?: string) => {
    if (text) {
        navigator.clipboard.writeText(text);
    }
};

export default App;
