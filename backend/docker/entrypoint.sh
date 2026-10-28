#!/bin/sh
set -e

cd /var/www/html

# Cualquier comando distinto de "serve" se ejecuta tal cual
# (ej: docker compose run --rm api php artisan tinker)
if [ "$1" != "serve" ]; then
  exec "$@"
fi

if [ -z "$APP_KEY" ]; then
  echo "ERROR: APP_KEY no esta definido. Generalo con 'php artisan key:generate --show' y ponlo en el .env" >&2
  exit 1
fi

# Los comandos artisan corren como www-data para no crear archivos de root
artisan() {
  su-exec www-data php artisan "$@"
}

artisan package:discover --ansi

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  echo "==> Ejecutando migraciones"
  artisan migrate --force
fi

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "==> Ejecutando seeders"
  artisan db:seed --force
fi

if [ "${GENERATE_SWAGGER:-true}" = "true" ]; then
  echo "==> Generando documentacion Swagger"
  artisan l5-swagger:generate || echo "WARN: no se pudo generar la documentacion Swagger"
fi

if [ "${APP_ENV}" = "production" ]; then
  echo "==> Cacheando configuracion, rutas y eventos"
  artisan optimize || echo "WARN: fallo artisan optimize"
fi

php-fpm -D
exec nginx -g 'daemon off;'