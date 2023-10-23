#!/bin/bash

error_message() {
    echo -e "\033[31m$1\033[0m" >&2
}

# cert files path
CERT_DIR="./.cert"
CERT_PEM="${CERT_DIR}/cert.pem"
KEY_PEM="${CERT_DIR}/key.pem"

# Check the cert files
if [[ -f "${CERT_PEM}" && -f "${KEY_PEM}" ]]; then
    echo "✅ Cert files exist"
else
    error_message "❌ Missing 'cert.pem' and 'key.pem' in the path './.cert'.\n👉 Please generate them by running \`yarn generate-dev-ssl-cert\`"
    exit 1
fi