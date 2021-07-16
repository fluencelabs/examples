(xor
    (seq
        (seq
            (call relay ("op" "identity") [])
            (call node_1 (service "curl_request") ["https://api.duckduckgo.com/?q=homotopy&format=json"] result)
        )
        (seq
            (call relay ("op" "identity") [])
            (call %init_peer_id% (returnService "run") [result])
        )
    )
    (seq
        (call relay ("op" "identity") [])
        (call %init_peer_id% (returnService "run") [%last_error%])
    )
)


