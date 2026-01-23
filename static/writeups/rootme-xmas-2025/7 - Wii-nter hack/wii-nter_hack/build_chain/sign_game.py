#!/usr/bin/env python3
# Wii Root-Me Edition — internal signing tool
# WARNING: DO NOT DISTRIBUTE OUTSIDE DEV TEAM

import sys
from Cryptodome.Signature import pkcs1_15
from Cryptodome.PublicKey import RSA
from Cryptodome.Hash import SHA256

if len(sys.argv) != 3:
    print(f"Usage: {sys.argv[0]} <private_key.pem> <file_to_sign>")
    sys.exit(1)

private_key_file = sys.argv[1]
file_to_sign = sys.argv[2]

# --- Load internal RSA key ---
with open(private_key_file, "rb") as f:
    private_key = RSA.import_key(f.read())

# --- Read game binary ---
with open(file_to_sign, "rb") as f:
    data = f.read()

# --- Compute SHA-256 hash (PyCryptodome) ---
hash_obj = SHA256.new(data)

# --- Sign the hash ---
signature = pkcs1_15.new(private_key).sign(hash_obj)

# --- Append signature to file (official release format) ---
with open(file_to_sign, "ab") as f:
    f.write(signature)

print(f"[ROOT-ME INTERNAL] Signature appended to '{file_to_sign}' - ready for Wii deployment.")
