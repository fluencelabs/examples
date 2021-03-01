(xor
    (seq
        (call node_1 (service "get_latest_block") ["MC5H2NK6ZIPMR32U7D4W35AWNNVCQX1ENH"] hex_result)
        (call %init_peer_id% (returnService "run") [hex_result])
    )
    (seq
        (call relay ("op" "identity") [])
        (call %init_peer_id% (returnService "run") ["XOR FAILED" %last_error%])
    )   
)