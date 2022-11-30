use sha2::{Digest, Sha256};

/// Derives a 32 byte randomness from the beacon's signature
pub fn derive_randomness(signature: &[u8]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(signature);
    hasher.finalize().into()
}

#[cfg(test)]
mod tests {
    use super::*;
    use hex_literal::hex;

    #[test]
    fn derives_randomness_correctly() {
        // curl -sS https://drand.cloudflare.com/public/72785
        let signature = hex::decode("82f5d3d2de4db19d40a6980e8aa37842a0e55d1df06bd68bddc8d60002e8e959eb9cfa368b3c1b77d18f02a54fe047b80f0989315f83b12a74fd8679c4f12aae86eaf6ab5690b34f1fddd50ee3cc6f6cdf59e95526d5a5d82aaa84fa6f181e42").unwrap();
        let expected_randomness =
            hex!("8b676484b5fb1f37f9ec5c413d7d29883504e5b669f604a1ce68b3388e9ae3d9");
        assert_eq!(derive_randomness(&signature), expected_randomness);

        // curl -sS https://drand.cloudflare.com/public/1337
        let signature = hex::decode("945b08dcb30e24da281ccf14a646f0630ceec515af5c5895e18cc1b19edd65d156b71c776a369af3487f1bc6af1062500b059e01095cc0eedce91713977d7735cac675554edfa0d0481bb991ed93d333d08286192c05bf6b65d20f23a37fc7bb").unwrap();
        let expected_randomness =
            hex!("2660664f8d4bc401194d80d81da20a1e79480f65b8e2d205aecbd143b5bfb0d3");
        assert_eq!(derive_randomness(&signature), expected_randomness);
    }
}
