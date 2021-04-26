(xor
    (seq
        (call relay (greeting_service  "greeting") [name greeter] result)
        (call %init_peer_id% (returnService "run") [result])
    )
    (call %init_peer_id% (returnService "run") [%last_error%])
)