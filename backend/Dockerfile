# syntax=docker/dockerfile:1

############################################
# Etapa 1: dependencias de Composer
############################################
FROM composer:2 AS vendor
WORKDIR /app

# Solo los manifiestos: esta capa se reutiliza mientras no cambie composer.lock
COPY composer.json composer.lock ./
RUN composer install \
      --no-dev --no-interaction --no-progress \
      --no-scripts --no-autoloader --prefer-dist \
      --ignore-platform-reqs

# Con el código presente se genera el autoloader optimizado
COPY . .
RUN composer dump-autoload --no-dev --optimize --no-scripts

############################################
# Etapa 2: imagen final de ejecución
############################################
FROM php:8.2-fpm-alpine AS runtime

# libpq es la libreria de ejecucion de PostgreSQL (se queda en la imagen).
# postgresql-dev solo se necesita para compilar pdo_pgsql y se elimina despues.
RUN apk add --no-cache nginx su-exec libpq \
    && apk add --no-cache --virtual .build-deps postgresql-dev \
    && docker-php-ext-install -j"$(nproc)" pdo_pgsql pdo_mysql opcache \
    && apk del .build-deps \
    && for ext in pdo_pgsql pdo_mysql mbstring openssl tokenizer xml ctype json; do \
         php -m | grep -qix "$ext" || { echo "Falta la extension: $ext"; exit 1; }; \
       done \
    && mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && mkdir -p /run/nginx \
    && ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

WORKDIR /var/www/html

# Configuración (cambia poco)
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/php.ini "$PHP_INI_DIR/conf.d/99-app.ini"
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# Solo vendor/ viene de la etapa de build
COPY --from=vendor /app/vendor ./vendor

# Código de la aplicación (cambia seguido, por eso va al final)
COPY . .

# Código de solo lectura; únicamente storage/ y bootstrap/cache/ son escribibles
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh \
    && chmod +x /usr/local/bin/entrypoint.sh \
    && mkdir -p storage/framework/cache/data \
                storage/framework/sessions \
                storage/framework/views \
                storage/logs \
                storage/api-docs \
                bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwX storage bootstrap/cache

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1:8000/up || exit 1

ENTRYPOINT ["entrypoint.sh"]
CMD ["serve"]