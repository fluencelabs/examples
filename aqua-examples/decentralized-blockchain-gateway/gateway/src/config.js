import fs from 'fs';

export const configHelp = "Config structure: { port, relay, serviceId, providers, mode, counterServiceId?, counterPeerId?}\n" +
    "Where 'mode' can be: 'random' (default), 'round-robin' or 'quorum',\n" +
    "'counterServiceId' and 'counterPeerId' will use local service if undefined.\n"
    "'quorumServiceId' and 'quorumPeerId' will use local service if undefined.\n"

export function readConfig(path) {
    const rawdata = fs.readFileSync(path);
    const config = JSON.parse(rawdata);

    let errors = []
    if (!config.port) {
        errors.push("Specify port ('port') in config")
    }
    if (!config.relay) {
        errors.push("Specify Fluence peer address ('relay') in config")
    }

    if (!config.serviceId) {
        errors.push("Specify id to ethereum Aqua service ('serviceId') in config")
    }

    return {
        config, errors,
        help: configHelp
    }
}
