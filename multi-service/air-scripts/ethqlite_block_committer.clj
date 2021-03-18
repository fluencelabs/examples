(xor
    (seq
        (seq
            (seq
                (seq
                    (seq
                        (call relay ("op" "identity") [])
                        (call node_1 (service_1 "get_latest_block") [api_key] hex_block_result)
                    )
                    (seq
                        (call relay ("op" "identity") [])
                        (call %init_peer_id% (returnService "run") [hex_block_result])
                    )
                )
                (seq
                    (seq
                        (call relay ("op" "identity") [])
                        (call node_2 (service_2 "hex_to_int") [hex_block_result] int_block_result)
                    )
                    (seq
                        (call relay ("op" "identity") [])
                        (call %init_peer_id% (returnService "run") [int_block_result])
                    )
                )
            )
            (seq
                (seq
                    (call relay ("op" "identity") [])
                    (call node_1 (service_1 "get_block") [api_key int_block_result] block_result)
                )
                (seq
                    (call relay ("op" "identity") [])
                    (call %init_peer_id% (returnService "run") [block_result])
                )
            )
        )
        (seq    
            (seq
                (call relay ("op" "identity") [])
                (call sqlite_node (sqlite_service "update_reward_blocks") [block_result] insert_result)
            )
            (seq
                (call relay ("op" "identity") [])
                (call %init_peer_id% (returnService "run") [insert_result])
            )
        )
    )
    (seq
        (call relay ("op" "identity") [])
        (call %init_peer_id% (returnService "run") ["XOR FAILED" %last_error%])
    )  
)
