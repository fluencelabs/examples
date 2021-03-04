(xor
    (seq
        (seq
            (call relay ("op" "identity") [])
            (call node_1 (service "get_block") [api_key block_num] result)
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