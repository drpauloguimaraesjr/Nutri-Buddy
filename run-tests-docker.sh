#!/usr/bin/env bash
set -euo pipefail

docker run --rm -it \
  -v "$(pwd)":/app \
  -w /app \
  alpine:3.20 \
  sh -c "apk add --no-cache bash curl jq >/dev/null && bash ./test-chat.sh"
