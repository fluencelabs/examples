(xor
    (seq
        (seq
            (call relay ("op" "identity") [])
            (call node_1 (service "get_latest_block") [api_key] hex_result)
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