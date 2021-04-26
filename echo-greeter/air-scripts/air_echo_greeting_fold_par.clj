(xor
    (seq
        (seq
            (call relay ("op" "identity") [])
            (call node_1 (echo_service "echo") [names]  array_result)
        )
        (seq
            (fold array_result item
                (par
                    (seq
                        (call node_2 (greeting_service_1 "greeting") [item.$.["echo"]! greeter] $greeting_1_result)
                        (call node_3 (greeting_service_2 "greeting") [item.$.["echo"]! no_greeter] $greeting_2_result)
                    )
                    (next item)
                )
            )
            (seq
                (call relay ("op" "identity") [])
                (call %init_peer_id% (returnService "run") [$greeting_1_result $greeting_2_result])
            )
        )
    )
    (seq
        (call relay ("op" "identity") [])
        (call %init_peer_id% (returnService "run") ["XOR FAILED %last_error"])
    )
)
