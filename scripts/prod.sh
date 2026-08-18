#!/usr/bin/env bash
# Corre localmente con la configuración real de PRODUCCIÓN
# (api/.env.render-prod) — apunta a la base de datos real de usuarios.
# Solo para diagnóstico puntual explícitamente decidido; pide confirmación
# escrita antes de arrancar nada.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
source scripts/_lib.sh

load_env_file .env.render-prod
require_db_host "$PROD_DB_HOST" "producción"

echo "########################################################"
echo "# ADVERTENCIA: esto corre localmente contra la base de   #"
echo "# datos de PRODUCCION real. Cualquier escritura afecta   #"
echo "# datos reales de usuarios.                              #"
echo "########################################################"
read -r -p "Escribe PRODUCCION (en mayúsculas) para continuar: " confirm
if [ "$confirm" != "PRODUCCION" ]; then
  echo "Cancelado."
  exit 1
fi

echo "== prod: build + start:prod con la config real de Render prod =="
npm run build
npm run start:prod
