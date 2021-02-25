(xor
    (seq
        (call relay (service "request") ["https://api.duckduckgo.com/?q=homotopy&format=json"] result)
        (call %init_peer_id% (returnService "run") [result])
    )
    (call %init_peer_id% (returnService "run") [%last_error%])
)
