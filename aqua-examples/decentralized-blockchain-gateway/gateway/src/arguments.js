export function readArguments(args) {
    const port = args[0]
    const relay = args[1]
    const configPath = args[2]
    const serviceId = args[3]

    let errors = []
    if (!port) {
        errors.push("Specify port")
    }
    if (!relay) {
        errors.push("Specify Fluence peer address")
    }
    if (!configPath) {
        errors.push("Specify config with uri to ethereum RPC providers")
    }
    if (!serviceId) {
        errors.push("Specify id to ethereum Aqua service")
    }

    return {
        port, relay, configPath, serviceId, errors,
        help: "Example: aqua-eth-gateway <port> <fluence-addr> <config-path> <service-id>"
    }
}