(xor
    (seq
        (call relay (service  "greeting") [name greeter] result)
        (call %init_peer_id% (returnService "run") [result])
    )
    (call %init_peer_id% (returnService "run") [%last_error%])
)