;; handle possible errors via xor
(xor
    (seq
        (seq                         
            ;; add
            (call relay (service_id "add_u256") [number_1 number_2] result_1)        
            ;; square result
            (call relay (service_id "mul_u256") [result_1.$.["u256"] result_1.$.["u256"]] result)
        )
        ;; return result back to the client
        (call %init_peer_id% (returnService "run") [result_1])
    )
    ;; if error, return it to the client (`returnService` is service on client with `run` action)
    (call %init_peer_id% (returnService "run") [%last_error%])
)
