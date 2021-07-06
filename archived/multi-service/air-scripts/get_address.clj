(xor
    (seq
        (seq
            (call relay ("op" "identity") [])
            (call my_node (service "extract_miner_address") [json_string] result)
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