(xor
    (seq
        (seq
            (call relay ("op" "identity") [])
            (call node_1 (service "owner_nuclear_reset") [] result)
        )
        (seq
            (call relay ("op" "identity") [])
            (call %init_peer_id% (returnService "run") [result])
        )
    )
    (seq
        (call relay ("op" "identity") [])
        (call %init_peer_id% (returnService "run") ["XOR FAILED" %last_error%])
    )   
)