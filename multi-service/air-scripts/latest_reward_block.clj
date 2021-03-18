(xor
    (seq
        (seq
                (seq
                    (seq
                        (call relay ("op" "identity") [])
                        (call node_1 (service_1 "get_latest_block") [api_key] hex_result)
                    )
                    (seq
                        (call relay ("op" "identity") [])
                        (call %init_peer_id% (returnService "run") [hex_result])
                    )
                )
                (seq
                    (seq
                        (call relay ("op" "identity") [])
                        (call node_2 (service_2 "hex_to_int") [hex_result] int_result)
                    )
                    (seq
                        (call relay ("op" "identity") [])
                        (call %init_peer_id% (returnService "run") [int_result])
                    )
                )
        )
        (seq

                (seq
                    (call relay ("op" "identity") [])
                    (call node_1 (service_1 "get_block") [api_key int_result] block_result)
                )
                (seq
                    (call relay ("op" "identity") [])
                    (call %init_peer_id% (returnService "run") [block_result])
                )
        )    
    )
    (seq
        (call relay ("op" "identity") [])
        (call %init_peer_id% (returnService "run") ["XOR FAILED" %last_error%])
    )   
)
