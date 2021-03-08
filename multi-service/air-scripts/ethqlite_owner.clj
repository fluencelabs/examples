(xor
    (seq
        (seq
            (call relay ("op" "identity") [])
            (call node_1 (service "am_i_owner") [] result)
            ; (call node_1 (service "get_tplet") [] result)
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