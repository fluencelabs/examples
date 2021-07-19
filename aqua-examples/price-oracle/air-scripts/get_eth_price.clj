(xor
    (seq
        (call relay (service "price_getter") [coin currency] result)
        (call %init_peer_id% (returnService "run") [result])
    )
    (seq
        (call relay ("op" "identity") [])
        (call %init_peer_id% (returnService "run") ["XOR FAILED" %last_error%])
    )
)