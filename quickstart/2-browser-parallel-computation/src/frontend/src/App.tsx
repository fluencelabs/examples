import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.scss';

import { Fluence, type ConnectionState } from '@fluencelabs/js-client';
import { resolveSubnet, add_one_parallel, add_one_sequential, add_one_single } from './compiled-aqua/getting-started';
import relays from "./relays.json";


const relayNodes = [relays[0], relays[1], relays[2]];

interface ComputationResult {
    host_id: string;
    value: number;
    worker_id: string;
}

function App() {
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [peerInfo, setPeerInfo] = useState<{ peerId: string; relayPeerId: string } | null>(null);

    const [numbers, setNumbers] = useState([1, 2, 3]);
    const [computedNumbers, setComputedNumbers] = useState<number[]>();
    const [computationInProgress, setComputationInProgress] = useState(false);

    const onNumberChange = (input: string, index: number) => {
        setNumbers([...numbers.slice(0, index), Number(input) || 0, ...numbers.slice(index + 1)]);
    }

    const numberContainers = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

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
        } catch (err) {
            console.log('Client could not connect', err);
        }
    };

    const getComputationResuls = async () => {
        const subnets = await resolveSubnet();
        const size = Math.max(subnets.length, numbers.length);

        const computationResults: ComputationResult[] = [];

        for (let i = 0; i < size; i++) {
            const workerId = subnets[i].worker_id;

            if (workerId === null) {
                continue;
            }

            computationResults.push({
                value: numbers[i],
                worker_id: workerId,
                host_id: subnets[i].host_id,
            })
        }

        return computationResults;
    };

    const computeSingleBtnOnClick = async () => {
        if (connectionState !== 'connected') {
            return;
        }
        setComputationInProgress(true);

        const computationResults = await getComputationResuls();

        const result = await add_one_single(computationResults[0]);
        setComputedNumbers([result]);
        setComputationInProgress(false);
    };

    const computeSequentialBtnOnClick = async () => {
        if (connectionState !== 'connected') {
            return;
        }
        setComputationInProgress(true);

        const computationResults = await getComputationResuls();

        const results = await add_one_sequential(computationResults);
        setComputedNumbers(results);
        setComputationInProgress(false);
    };

    const computeParallelBtnOnClick = async () => {
        if (connectionState !== 'connected') {
            return;
        }
        setComputationInProgress(true);

        const computationResults = await getComputationResuls();

        const results = await add_one_parallel(computationResults);
        setComputedNumbers(results);
        setComputationInProgress(false);
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
                            <h2>Input numbers for computation</h2>
                            <p className="p">
                                Input 3 numbers for parallel computation
                            </p>
                            {
                                numberContainers.map((ref, i) => (
                                    <div className="row" key={i}>
                                        <label className="label bold">Number {i}</label>
                                        <input
                                            ref={ref}
                                            style={{width: 'auto'}}
                                            id="targetPeerId"
                                            className="input"
                                            type="text"
                                            onChange={(e) => onNumberChange(e.target.value, i)}
                                            value={numbers[i]}
                                        />
                                    </div>
                                ))
                            }
                            <div className="row">
                                <button className="btn btn-hello" style={{float: 'initial'}} onClick={computeSingleBtnOnClick}>
                                    Compute single
                                </button>
                            </div>

                            <div className="row">
                                <button className="btn btn-hello" style={{float: 'initial'}} onClick={computeSequentialBtnOnClick}>
                                    Compute sequential
                                </button>
                            </div>

                            <div className="row">
                                <button className="btn btn-hello" style={{float: 'initial'}} onClick={computeParallelBtnOnClick}>
                                    Compute parallel
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <h1>Intro 2: Computing on the network</h1>
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

                {(computedNumbers || computationInProgress) && (
                    <>
                        <h2>Computation result</h2>
                        <div id="message"> {computationInProgress ? '...' : JSON.stringify(computedNumbers)} </div>
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
