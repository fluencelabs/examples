export interface AccountState {
    amount: string,
    block_hash: string,
    block_height: number,
    code_hash: string,
    locked: string,
    storage_paid_at: number,
    storage_usage: number
}

export interface GetBalance {
    available: string,
    staked: string,
    stateStaked: string,
    total: string
}



interface ReceiptsOutcome {
    "block_hash": string,
    "id": string,
    "outcome": {
        "executor_id": string,
        "gas_burnt": number,
        "logs": Array<string>,
        "metadata": {
            "gas_profile": Array<string>,
            "version": number
        },
        "receipt_ids": Array<string>,
        "status": {
            "SuccessValue": string
        },
        "tokens_burnt": string
    },
    "proof": Array<string>
}

interface TransactionOutcome {

}

export interface SendMoneyReceipt {
    "receipts_outcome": Array<ReceiptsOutcome>,
    "status": {
        "SuccessValue": ""
    },
    "transaction": {
        "actions": [
            {
                "Transfer": {
                    "deposit": "10000"
                }
            }
        ],
        "hash": "CmK9rhgBSmamMHhYMzqkeNcH4CtaSvtCHHqkrL4UwM4n",
        "nonce": 74253069000001,
        "public_key": "ed25519:632DzcF3w7SLXJzDRcFdSHUBY2De8LECfJ9kCC4yERuj",
        "receiver_id": "boneyard93501.testnet",
        "signature": "ed25519:XJieAFpDwJHpvJ3QavjevfQkNAP5rFkXzBXYgUSrB2aUU88n8JDLJgxdkaT6yaj8DstjGbnfXug4AVKyzGmJhnm",
        "signer_id": "boneyard93502.testnet"
    },
    "transaction_outcome": {
        "block_hash": "2Tuq4SCMJBxwhnnVyoHvAZbvydouDTk2DT7Z9F2kZnsy",
        "id": "CmK9rhgBSmamMHhYMzqkeNcH4CtaSvtCHHqkrL4UwM4n",
        "outcome": {
            "executor_id": "boneyard93502.testnet",
            "gas_burnt": 223182562500,
            "logs": [],
            "metadata": {
                "gas_profile": null,
                "version": 1
            },
            "receipt_ids": [
                "3c8CSgyEuisq8CcMgPGt7TVkiYBwei4vkR6CpJdcogbB"
            ],
            "status": {
                "SuccessReceiptId": "3c8CSgyEuisq8CcMgPGt7TVkiYBwei4vkR6CpJdcogbB"
            },
            "tokens_burnt": "22318256250000000000"
        },
        "proof": []
    }
}













interface Result {
    stderr: string,
    stdout: string
};
