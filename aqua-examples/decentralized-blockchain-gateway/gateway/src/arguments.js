import {configHelp} from "./config.js";

export function readArguments(args) {
    const configPath = args[0]

    let errors = []

    if (!configPath) {
        errors.push("Specify config with uri to ethereum RPC providers")
    }

    return {
        configPath, errors,
        help: "Example: aqua-eth-gateway <config-path>\n" + configHelp
    }
}