(xor
    (seq
            
        (call node_1 (service_1 "get_latest_block") [api_key] hex_result)
        (call %init_peer_id% (returnService "run") [hex_result])
        (call node_2 (service_2 "hex_to_int") [hex_result] result)
        (call %init_peer_id% (returnService "run") [result])
    )
    (seq
        (call relay ("op" "identity") [])
        (call %init_peer_id% (returnService "run") ["XOR FAILED" %last_error%])
    )   
)