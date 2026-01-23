#!/bin/bash
# Wii Root-Me Edition — internal key generation tool
# WARNING: DO NOT DISTRIBUTE OUTSIDE DEV TEAM

# Generate a 2048-bit RSA private key
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
echo "Private key saved to private_key.pem"

# Extract the public key from the private key
openssl rsa -pubout -in private_key.pem -out public_key.pem
echo "Public key saved to public_key.pem"
