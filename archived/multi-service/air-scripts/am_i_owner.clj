(xor
    (seq
        (seq
            (call relay ("op" "identity") [])
            (call node (service "am_i_owner") [] result)
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
