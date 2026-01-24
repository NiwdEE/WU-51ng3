import os
from tgcrypto import ige256_decrypt, ige256_encrypt
from binascii import hexlify

def xor(*args: bytes) -> bytes:
    final = []
    for col in zip(*args):
        res = 0
        for b in col:
            res ^= b
        final.append(res)
    return bytes(final)

def chunkify(b: bytes, s: int) -> list[bytes]:
    assert len(b) % s == 0, "Invalid input length"
    return [ b[i:i+s] for i in range(0, len(b), s)]


def forge(target_plain: bytes, oracle_plain: bytes, oracle_cipher: bytes, BLOCK_SIZE=16) -> tuple[bytes, bytes, bytes]:
    oracle_len = len(oracle_plain) // BLOCK_SIZE
    assert len(target_plain) == BLOCK_SIZE*2, f"Your target plaintext should be {BLOCK_SIZE*2} bytes long ({len(target_plain)} bytes given)"
    assert len(oracle_plain) % BLOCK_SIZE == 0, f"Your oracle plaintext should be {(oracle_len+1)*16} (currently {len(oracle_plain)}) bytes long as it needs {oracle_len+1} blocks (try to add padding)"
    assert len(oracle_plain) == len(oracle_cipher), f"Your oracle plaintext and ciphertext must be the same size ({len(oracle_plain)} vs {len(oracle_cipher)} bytes)"

    T = chunkify(target_plain, BLOCK_SIZE)
    P = chunkify(oracle_plain, BLOCK_SIZE)
    C = chunkify(oracle_cipher, BLOCK_SIZE)

    M = [None] * oracle_len
    M[0] = xor(P[1], C[0], T[1])
    for n in range(1, oracle_len):
        M[n] = xor(C[n], P[n-1], T[n-1])
        if n > 1:
            T.append(xor(T[n-2], P[n], P[n-2]))

    mIV0 = xor(P[1], C[0], T[0])
    mIV1 = xor(C[1], P[0], M[0])

    return (b''.join(M), mIV0+mIV1, b''.join(T))


def main():
    key = os.urandom(32)
    iv = os.urandom(32)

    BLOCK_SIZE = 16
    T = b"This is exactly why IGE is bad^^"
    P = os.urandom(2*BLOCK_SIZE)
    C = ige256_encrypt(P, key, iv)

    (M, mIV, R) = forge(T, P, C)

    print("\n\n------------Example with 2 blocks of data----------------")
    print("Oracle plaintext:", P)
    print("Oracle cipher:", hexlify(C))
    print("Malicious cipher:", hexlify(M))
    print("Malicious IV:", hexlify(mIV))
    print("Should decode to:", R)
    print("\nResult: ", ige256_decrypt(M, key, mIV))
    print("---------------------------------------------------------")


    P = os.urandom(3*BLOCK_SIZE)
    C = ige256_encrypt(P, key, iv)

    (M, mIV, R) = forge(T, P, C)

    print("\n\n------------Example with 3 blocks of data----------------")
    print("Oracle plaintext:", P)
    print("Oracle cipher:", hexlify(C))
    print("Malicious cipher:", hexlify(M))
    print("Malicious IV:", hexlify(mIV))
    print("Should decode to:", R)
    print("\nResult: ", ige256_decrypt(M, key, mIV))
    print("---------------------------------------------------------")


if __name__=="__main__":
    main()


