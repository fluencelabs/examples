(xor
    (seq
        (seq
            (seq
                (call relay ("op" "identity") [])
                (call node (echo_service "echo") [names]  array_result)
            )
            (seq
                (seq
                    (call relay ("op" "identity") [])
                    (call %init_peer_id% (returnService "run") [array_result])
                )
                (seq
                    (fold array_result item
                        (seq
                            (seq
                                (call relay ("op" "identity") [])
                                (call node (greeting_service "greeting") [item] greeter_results[])
                            )
                            (seq
                                (call relay ("op" "identity") [])
                                (next item)
                            )
                        )
                    )
                    (seq
                        (call relay ("op" "identity") [])
                        (call %init_peer_id% ("returnService" "run") [greeter_results])
                    )
                )
            )
        )
        (seq
            (seq
                (call relay ("op" "identity") [])
                (call node (greeting_service "greeting") ["boo yah"] last_result)
            )
            (seq
                (call relay ("op" "identity") [])
                (call %init_peer_id% (returnService "run") [last_result])
            )
        )
    )
    (seq
        (call relay ("op" "identity") [])
        (call %init_peer_id% (returnService "run") ["XOR FAILED %last_error"])
    )
)