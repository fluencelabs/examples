(xor
    (seq
        (call relay (service "ether_price_getter") ["32fc4c0e-59cf-4245-8f22-d4095de0f738" "EUR"] result)
        (call %init_peer_id% (returnService "run") [result])
    )
    (seq
        (call relay ("op" "identity") [])
        (call %init_peer_id% (returnService "run") ["XOR FAILED" %last_error%])
    )
)