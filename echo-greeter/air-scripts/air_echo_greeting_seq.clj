(xor
    (seq
        (seq
            (seq
                (call relay ("op" "identity") [])
                (call node_1 (echo_service "echo") [names]  echo_result)
            )
            (seq
                (call relay ("op" "identity") [])
                (call %init_peer_id% (returnService "run") [echo_result])
            )
        )
        (seq
            (seq
                (seq
                    (call relay ("op" "identity") [])
                    (call node_2 (greeting_service_1 "greeting") [echo_result.$.[0]["echo"]! greeter]  greeter_result_0)
                )
                (seq
                    (call relay ("op" "identity") [])
                    (call %init_peer_id% (returnService "run") [greeter_result_0]) 
                )
            )
            (seq
                (seq
                    (call relay ("op" "identity") [])
                    (call node_3 (greeting_service_2 "greeting") [echo_result.$.[2]["echo"]! greeter]  greeter_result_1)
                )
                (seq
                    (call relay ("op" "identity") [])
                    (call %init_peer_id% (returnService "run") [greeter_result_1]) 
                )        
            )
        )
    )
    (seq
        (call relay ("op" "identity") [])
        (call %init_peer_id% (returnService "run") ["XOR FAILED" %last_error%])
    )

)