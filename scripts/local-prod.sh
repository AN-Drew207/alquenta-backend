#!/usr/bin/env bash
# Build de producción corrido en tu máquina (build + start:prod, sin watch),
# pero contra la base "develop" — para detectar problemas del build (como
# el OOM de Render de 2026-08-15) sin arriesgar datos reales. Usa api/.env.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
source scripts/_lib.sh

load_env_file .env
refuse_prod_host

echo "== local-prod: build + start:prod, DB host esperado: develop =="
npm run build
npm run start:prod
