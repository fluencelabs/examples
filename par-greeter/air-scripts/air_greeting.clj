(xor
    (seq
        (call relay (greeting_service  "greeting") [name] result)
        (call %init_peer_id% (returnService "run") [result])
    )
    (seq
        (call relay (greeting_service  "greeting") [name] result)
        (call %init_peer_id% (returnService "run") [%last_error%])
    )
)