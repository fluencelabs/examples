    (xor
        (seq
                (call node ("script" "add") [script interval] id)
                (call %init_peer_id% (returnService "run") [id])
        )
        (seq
                (call relay ("op" "identity") [])
                (call %init_peer_id% (returnService "run") ["XOR FAILED" %last_error%])
        )   
)
