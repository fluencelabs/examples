(xor
    (seq
        (call relay (service "create_cf") ["0"] result)
        (call %init_peer_id% (returnService "run") [result])
    )
    (seq
        (call relay ("op" "identity") [])
        (call %init_peer_id% (returnService "run") ["XOR FAILED"])
    )
)
