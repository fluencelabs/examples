;; addds two numbers and than squares result (a+b)^2
(xor ;; handle possible errors via xor 
    (seq
        (seq
            ;; create variable for success code to match (air does not support arbitrary value matches)
            (call relay ("op" "identity") [0] success)            
            (seq
                (seq 
                    (seq 
                        (call relay ("op" "identity") [])
                        (call relay (service_id "add") [a b] add_result)                                
                    )
                    (seq 
                        (call relay ("op" "identity") [add_result.$.ret_code] add_ret_code)
                        (call relay ("op" "identity") [add_result.$.value] value)
                    )
                )
                (xor
                    ;; multiply only if add was okey
                    (match add_ret_code.$.[0] success                             
                        (seq 
                            ;; retur back to relay so can return result value to non node peer
                            (call relay ("op" "identity") [])
                            (call relay (service_id "mul") [value value] mul_result)        
                        )
                    )
                    (call %init_peer_id% (returnService "run") ["add failed" add_result])
                )
            )
        )
        ;; return result back to the client
        (call %init_peer_id% (returnService "run") [mul_result])
    )
    ;; if error, return it to the client (`returnService` is service on client with `run` action)
    (call %init_peer_id% (returnService "run") [%last_error%])
)
