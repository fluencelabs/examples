    (xor
        (seq
                (call node ("script" "remove") [script_id] result)
                (call %init_peer_id% (returnService "run") [result])
        )
        (seq
                (call relay ("op" "identity") [])
                (call %init_peer_id% (returnService "run") ["XOR FAILED" %last_error%])
        )   
)
