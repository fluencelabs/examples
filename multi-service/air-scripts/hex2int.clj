(xor
    (seq
        (seq
            (call relay ("op" "identity") [])
            (call node_1 (service "hex_to_int") [hex_string] hex_result)
        )
        (seq
            (call relay ("op" "identity") [])
            (call %init_peer_id% (returnService "run") [hex_result])
        )
    )
    (seq
        (call relay ("op" "identity") [])
        (call %init_peer_id% (returnService "run") ["XOR FAILED" %last_error%])
    )   
)