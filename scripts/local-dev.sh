#!/usr/bin/env bash
# Desarrollo local del día a día: nest en modo watch, contra la base
# "develop" de Neon. Usa api/.env — se aborta si ese archivo llegara a
# apuntar a producción.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
source scripts/_lib.sh

load_env_file .env
refuse_prod_host

echo "== local-dev: APP_ENV=${APP_ENV:-?}, DB host esperado: develop =="
npm run start:dev
