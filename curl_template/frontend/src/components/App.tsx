import { createClient, FluenceClient } from '@fluencelabs/fluence';
import React, { useEffect, useState } from 'react';
import {
    relayNode,
    curlRequest
} from 'src/fluence';

import './App.scss';

const App = () => {
    const [client, setClient] = useState<FluenceClient | null>(null);
    const [url, setUrl] = useState('https://api.duckduckgo.com/?q=homotopy&format=json');
    const [data, setData] = useState<{url: String, response: String}[]>([]);

    useEffect(() => {
        const fn = async () => {
            try {
                const client = await createClient(relayNode);
                setClient(client);
            } catch (err) {
                console.log('Client initialization failed', err);
            }
        };
        fn();
    }, []);

    const request = async () => {
        if (!client) {
            return;
        }

        let response = await curlRequest(client, url, 10000);
        console.log(JSON.stringify(response));
        setData((prev) => [...prev, { url, response: response[0].stdout }]);
    };

    const stop = async () => {
        if (!client) {
            return;
        }

    };

    return (
        <>
            <div className="header-wrapper">
                <div className="header">
                    <div className="header-item"></div>

                    <div className="header-item">
                        Connection status: {client ? <span className="accent">connected</span> : 'disconnected'}
                    </div>
                </div>
            </div>
            <div className="content">
                <div>Url. e.g: https://google.com</div>
                <div>
                    <input
                        className="text-input"
                        onChange={(e) => setUrl(e.target.value)}
                        type="text"
                        value={url}
                    />
                </div>
                <div className="buttons">
                    <button disabled={!url} className="button" onClick={request}>
                        request
                    </button>
                </div>


                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Request log.</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.map(({url, response}, idx) => (
                            <tr>
                                <td className="td1">{url}</td>
                                <td className="td2">{response}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default App;
