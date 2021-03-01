(xor
    (seq
        (call node_1 (service “get_latest_block”) [“api_key”] hex_result)
        (call %init_peer_id% (returnService “run”) [hex_result])
        ;; result is latest block number as a hex string
        (call node_4 (service “hex_to_int”) [hex_result] result)
        (call %init_peer_id% (returnService “run”) [result])
        ;; result is latest block number as a u64

        (par
            (seq
                (call node_2 (service “get_block”) [“api_key” result] result_0_0)
                (call %init_peer_id% (returnService “run”) result_0_0)
                ;; returns a json string for block
                (call node_3 (service “extract_miner) [result_0_0] result_0_1)
                (call %init_peer_id% (returnService “run”) [result_0_1])
                ;; returns the miner address as hex string
            )
            (seq
                (call node_2 (service “get_block”) [“api_key”  result-1] result_1_0)
                (call %init_peer_id% (returnService “run”) result_1_0)
                (call node_3 (service “extract_miner) [result_1_0] result_1_1)
                (call %init_peer_id% (returnService “run”) [result_1_1])
            )
            (seq
                (call node_2 (service “get_block”) [“api_key”  result-2] result_2_0)
                (call %init_peer_id% (returnService “run”) result_2_0)
                (call node_3 (service “extract_miner) [result_2_0] result_2_1)
                (call %init_peer_id% (returnService “run”) [result_2_1])
            )
            (seq
                (call node_2 (service “get_block”) [“api_key”  result-3] result_3_0)
                (call %init_peer_id% (returnService “run”) result_3_0)
                (call node_3 (service “extract_miner) [result_3_0] result_3_1)
                (call %init_peer_id% (returnService “run”) [result_3_1])
            )
        )
        
    )
    (seq
        (call relay (“op” “identity”) [])
        (call %init_peer_id% (returnService “run”) [“XOR FAILED” %last_error%])
    )   
)