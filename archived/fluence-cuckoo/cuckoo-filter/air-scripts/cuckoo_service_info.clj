(seq
    (call relay (service "service_info") [] result)
    (call %init_peer_id% (returnService "run") [result])
)
