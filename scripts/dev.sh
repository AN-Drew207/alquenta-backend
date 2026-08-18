#!/usr/bin/env bash
# Corre localmente con exactamente la misma configuración que Render usa
# para "alquenta-backend-dev" (api/.env.render-dev) — build + start:prod,
# igual que en Render, para reproducir problemas de ese entorno sin
# desplegar. Sigue apuntando a la base "develop", nunca a producción.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
source scripts/_lib.sh

load_env_file .env.render-dev
require_db_host "$DEV_DB_HOST" "develop"

echo "== dev: build + start:prod con la config real de Render dev =="
npm run build
npm run start:prod
