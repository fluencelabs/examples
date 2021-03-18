    (xor
        (seq
                (call node ("script" "list") [] list)
                (call %init_peer_id% (returnService "run") [list])
        )
        (seq
                (call relay ("op" "identity") [])
                (call %init_peer_id% (returnService "run") ["XOR FAILED" %last_error%])
        )   
)
