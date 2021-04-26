(xor
    (seq
        (seq
            (call relay ("op" "identity") [])
            (call relay (echo_service "echo") [names]  array_result)
        )
        (seq
            (call relay ("op" "identity") [])
            ; (call %init_peer_id% (returnService "run") [array_result.$.[0]["echo"]])
            (call %init_peer_id% (returnService "run") [array_result])
        )
    )
    (seq
        (call relay ("op" "identity") [])
        (call %init_peer_id% (returnService "run") ["XOR FAILED: " %last_error%])
    )
)
