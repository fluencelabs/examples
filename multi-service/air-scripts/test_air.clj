    (xor
        (seq
                (call relay (service "get_latest_block") [api_key] result)
                (call %init_peer_id% (returnService "run") [result])
        )
        (seq
                (call relay ("op" "identity") [])
                (call %init_peer_id% (returnService "run") ["XOR FAILED" %last_error%])
        )   
)
