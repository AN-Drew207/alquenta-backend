#!/usr/bin/env bash
# Helpers compartidos por scripts/*.sh. No se ejecuta directamente.
set -euo pipefail

DEV_DB_HOST="ep-long-scene-axf0lhh2"
PROD_DB_HOST="ep-empty-shape-axezc2a4"

# Carga variables KEY=VALUE de un archivo de entorno al shell actual.
load_env_file() {
  local file="$1"
  if [ ! -f "$file" ]; then
    echo "Error: no existe $file. Ver .env.example para crearlo." >&2
    exit 1
  fi
  set -a
  # shellcheck disable=SC1090
  source "$file"
  set +a
}

# Aborta si DATABASE_URL no contiene el host esperado.
require_db_host() {
  local expected="$1"
  local label="$2"
  if [[ "${DATABASE_URL:-}" != *"$expected"* ]]; then
    echo "Error: DATABASE_URL no apunta al host esperado de $label ($expected)." >&2
    echo "DATABASE_URL actual: ${DATABASE_URL:-<vacío>}" >&2
    exit 1
  fi
}

# Aborta si DATABASE_URL apunta a producción — usar en todo script que no
# deba tocar producción bajo ninguna circunstancia.
refuse_prod_host() {
  if [[ "${DATABASE_URL:-}" == *"$PROD_DB_HOST"* ]]; then
    echo "Error: DATABASE_URL apunta a PRODUCCIÓN ($PROD_DB_HOST)." >&2
    echo "Este script es solo para desarrollo — abortando para no arriesgar datos reales." >&2
    exit 1
  fi
}
