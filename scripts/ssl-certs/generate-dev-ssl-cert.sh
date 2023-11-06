#!/bin/bash

error_message() {
    echo -e "\033[31m$1\033[0m" >&2
}

if ! which mkcert >/dev/null 2>&1; then
    error_message "Error: mkcert is not found in your system."
    error_message "Please follow the instructions in https://github.com/FiloSottile/mkcert#macos to install it."
    exit 1
fi

# Created a new local CA & Make it to be TRUSTED in system
mkcert -install

# Create .cert directory if it doesn't exist
mkdir -p .cert

# Generate a self-signed certificate for "*.beep.local.shub.us"
mkcert -key-file ./.cert/key.pem -cert-file ./.cert/cert.pem "*.beep.local.shub.us" "localhost" "127.0.0.1"