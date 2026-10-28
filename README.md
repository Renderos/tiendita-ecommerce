# Tiendita — E-commerce de supermercado

Tienda en línea de supermercado: catálogo por categorías, carrito, registro e inicio de sesión, y pago con tarjeta mediante Stripe (modo test). El proyecto está dividido en dos servicios que se ejecutan en contenedores Docker:

- **API REST** en **Laravel 12** (PHP 8.2) con autenticación por tokens (**Sanctum**) y cobros con **Stripe**.
- **Frontend** en **Next.js 16** (App Router, React 19, Tailwind CSS 4).

La base de datos es **PostgreSQL administrado en Neon**: ya trae el esquema y los datos de prueba (9 categorías, 12 marcas, 46 productos y 2 cupones), así que no forma parte del `docker-compose`.

**Demo desplegada**

| Servicio | URL |
|---|---|
| Frontend (Vercel) | https://tiendita-ecommerce.vercel.app |
| API (Railway, misma imagen Docker del repo) | https://api-production-b2b5e.up.railway.app/api/products |

---

## Contenido del repositorio

```
.
├── docker-compose.yml        # Orquesta los servicios api y frontend
├── .env.example              # Variables que necesita docker compose (documentadas)
├── backend/                  # API Laravel 12
│   ├── Dockerfile            # Build multi-stage: Composer -> PHP-FPM + Nginx
│   ├── .dockerignore
│   ├── docker/
│   │   ├── entrypoint.sh     # Arranque: valida APP_KEY, migraciones opcionales, php-fpm + nginx
│   │   ├── nginx.conf        # Nginx escuchando en :8000, solo ejecuta public/index.php
│   │   └── php.ini           # Ajustes de producción y OPcache
│   ├── app/                  # Controladores, modelos y Form Requests
│   └── routes/api.php        # Endpoints de la API
└── frontend/                 # Next.js 16
    ├── Dockerfile            # Build multi-stage: deps -> next build -> runner standalone
    ├── .dockerignore
    └── app/                  # Páginas (catálogo, producto, carrito, checkout, pedidos, login, registro)
```

---

## Arquitectura de contenedores

```
                 Navegador
                     │  http://localhost:3000
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ docker compose · red bridge "tiendita-net"                  │
│                                                             │
│  ┌──────────────────────────┐      ┌──────────────────────┐ │
│  │ frontend                 │      │ api                  │ │
│  │ node:20-alpine           │ HTTP │ php:8.2-fpm-alpine   │ │
│  │ Next.js standalone       ├─────►│ Nginx :8000          │ │
│  │ :3000  (usuario nextjs)  │ api: │   └─► PHP-FPM :9000  │ │
│  │                          │ 8000 │       Laravel 12     │ │
│  └──────────────────────────┘      └──────────┬───────────┘ │
│        depends_on: api (service_healthy)      │             │
└───────────────────────────────────────────────┼─────────────┘
                                                │ PostgreSQL + SSL
                         ┌──────────────────────┼─────────────┐
                         ▼                      ▼             │
                  Stripe API (HTTPS)     Neon PostgreSQL      │
                  cobro del pedido       (servicio externo)   │
```

**Cómo fluye una petición**

1. El navegador solo habla con el **frontend** (puerto `3000`).
2. Next.js renderiza las páginas en el servidor (Server Components y Server Actions) y llama a la API por la red interna de Docker, usando el nombre del servicio: `API_URL=http://api:8000/api`. El navegador nunca llama a la API directamente, así que no hace falta configurar CORS y el token de sesión se guarda en una cookie `httpOnly`.
3. El contenedor **api** recibe la petición en Nginx (`:8000`), que la pasa a PHP-FPM (`127.0.0.1:9000`) dentro del mismo contenedor. Laravel consulta Neon por SSL y, al pagar, crea un `PaymentIntent` en Stripe.
4. En el checkout, el navegador usa Stripe.js con la llave pública (`pk_test_...`) solo para tokenizar la tarjeta. El cobro real lo hace la API con la llave secreta.

**Orden de arranque y salud**

- `api` tiene un `HEALTHCHECK` que consulta `GET /up` (ruta de salud de Laravel).
- `frontend` usa `depends_on: condition: service_healthy`: no arranca hasta que la API responde, así se evitan errores en las primeras peticiones.
- Ambos servicios usan `restart: unless-stopped`.

---

## Cómo ejecutar el ecosistema

### Requisitos

- Docker Desktop (o Docker Engine + plugin Compose v2).
- Credenciales de la base de Neon y llaves de Stripe en modo test.

### Pasos

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/Renderos/tiendita-ecommerce.git
   cd tiendita-ecommerce
   ```

2. **Crear el archivo `.env`** a partir de la plantilla y completar los valores (cada variable está explicada en el propio archivo):

   ```bash
   cp .env.example .env
   ```

   | Variable | Para qué sirve |
   |---|---|
   | `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Conexión a Neon. Usa el host **directo** (sin `-pooler`). |
   | `DB_SSLMODE` | `require`: Neon rechaza conexiones sin SSL. |
   | `APP_KEY` | Clave de cifrado de Laravel. Es obligatoria. |
   | `APP_URL` | URL pública de la API. |
   | `STRIPE_KEY` | Llave pública `pk_test_...`. También se pasa al frontend al compilar. |
   | `STRIPE_SECRET` | Llave secreta `sk_test_...`. Solo la usa la API. |
   | `RUN_MIGRATIONS` / `RUN_SEED` | `false` con Neon, porque el esquema y los datos ya existen. |
   | `GENERATE_SWAGGER` | `false` (el paquete l5-swagger no está instalado). |

3. **Generar `APP_KEY`** (si no tienes una) y pegarla en `.env`:

   ```bash
   docker compose run --rm --no-deps api php artisan key:generate --show
   ```

   > Este comando ya construye la imagen de la API. Compose exige que `APP_KEY` exista en `.env`, así que la primera vez pon cualquier valor temporal (por ejemplo `APP_KEY=temp`), genera la clave y reemplázala.

4. **Construir y levantar los contenedores**

   ```bash
   docker compose up --build -d
   ```

5. **Abrir la aplicación**

   | Qué | URL |
   |---|---|
   | Tienda (frontend) | http://localhost:3000 |
   | API — catálogo | http://localhost:8000/api/products |
   | API — salud | http://localhost:8000/up |

### Comandos útiles

```bash
docker compose ps                 # estado y salud de los servicios
docker compose logs -f api        # logs de Laravel, Nginx y PHP-FPM
docker compose logs -f frontend   # logs de Next.js
docker compose build frontend     # reconstruir el frontend (p. ej. si cambia STRIPE_KEY)
docker compose down               # detener y eliminar los contenedores
```

### Probar un pago

Regístrate en la tienda, agrega productos al carrito y paga con la tarjeta de prueba de Stripe `4242 4242 4242 4242` (cualquier fecha futura y cualquier CVC). El pedido aparece en **Historial de compras** (`/orders`) como pagado y el cobro se ve en el dashboard de Stripe (modo test).

---

## API

Base: `http://localhost:8000/api`. Las rutas protegidas requieren el header `Authorization: Bearer <token>` que devuelve `/login`.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/register` | — | Crear cuenta y obtener token |
| POST | `/login` | — | Iniciar sesión y obtener token |
| GET | `/products` | — | Listar productos activos con categoría y marca |
| GET | `/products/{id}` | — | Detalle de un producto |
| GET | `/user` | ✔ | Usuario autenticado |
| POST | `/logout` | ✔ | Revocar el token actual |
| GET | `/orders` | ✔ | Historial de pedidos del usuario |
| GET | `/orders/{id}` | ✔ | Detalle de un pedido propio |
| POST | `/orders` | ✔ | Crear pedido y cobrarlo con Stripe |
| POST / PUT / DELETE | `/products...` | ✔ | Administración de productos (crear, editar, eliminar, restaurar) |

---

## Decisiones técnicas de cada Dockerfile

### `backend/Dockerfile` (API Laravel)

| Decisión | Por qué |
|---|---|
| **Multi-stage**: etapa `vendor` con `composer:2` y etapa final `php:8.2-fpm-alpine` | Composer y su caché se quedan en la primera etapa. La imagen final solo lleva PHP, las extensiones y `vendor/`, así que pesa menos y tiene menos superficie de ataque. |
| Copiar primero `composer.json` + `composer.lock` y luego el código | Docker reutiliza la capa de dependencias mientras no cambie el lock, lo que acelera mucho los rebuilds. |
| `composer install --no-dev --no-scripts --no-autoloader` y luego `dump-autoload --optimize` | Sin dependencias de desarrollo (PHPUnit, Pint…). El autoloader optimizado (classmap) carga clases más rápido en producción. |
| Base **Alpine** | La imagen base es mucho más pequeña que la de Debian. |
| `pdo_pgsql` compilado con `postgresql-dev` como `.build-deps` y eliminado después; se conserva solo `libpq` | Las cabeceras de compilación no quedan en la imagen final; solo la librería que se necesita en ejecución. |
| Verificación de extensiones (`php -m`) durante el build | Si falta una extensión requerida (pdo_pgsql, mbstring, openssl…), el build falla de inmediato en lugar de fallar en ejecución. |
| **Nginx + PHP-FPM en el mismo contenedor** | PHP-FPM solo habla FastCGI. Nginx expone HTTP en `:8000` y sirve un solo endpoint (`public/index.php`), así el contenedor se comporta como un servicio web autónomo que funciona igual en compose que en Railway. |
| `nginx.conf` solo ejecuta `/index.php`, `server_tokens off`, cabeceras `X-Frame-Options` y `nosniff` | Evita ejecutar otros `.php` subidos o filtrados y no revela versiones. |
| `php.ini-production` + `docker/php.ini` con **OPcache** (`validate_timestamps=0`) y `expose_php=Off` | El código no cambia dentro de la imagen, así que OPcache puede no revisar los archivos en disco: mejor rendimiento. |
| Permisos: el código es de solo lectura; solo `storage/` y `bootstrap/cache/` pertenecen a `www-data` | Si un proceso se ve comprometido, no puede modificar el código de la app. |
| `entrypoint.sh`: valida `APP_KEY`, migraciones y seed opcionales (`RUN_MIGRATIONS`, `RUN_SEED`), `artisan optimize` en producción, y comandos artisan con `su-exec www-data` | El mismo contenedor sirve para varios entornos según variables de entorno. Falla rápido con un mensaje claro si falta la clave. Los archivos de caché no quedan como `root`. |
| `sed -i 's/\r$//'` sobre el entrypoint | Si el repo se clona en Windows con finales de línea CRLF, el script igual se ejecuta en Linux. |
| `HEALTHCHECK` contra `/up` | Permite que el frontend espere a que la API esté sana (`service_healthy`). Railway usa la misma ruta. |
| `.dockerignore` excluye `.env*`, `vendor`, `node_modules`, `tests`, logs y cachés | Builds más rápidos y nunca se copian secretos ni artefactos locales a la imagen. |

### `frontend/Dockerfile` (Next.js)

| Decisión | Por qué |
|---|---|
| **Tres etapas**: `deps` → `builder` → `runner` sobre `node:20-alpine` | Las dependencias de desarrollo y el código fuente se quedan en etapas intermedias. La imagen final solo lleva lo necesario para ejecutar. |
| `output: "standalone"` en `next.config.ts` | `next build` genera `server.js` con solo los `node_modules` que realmente se usan. La imagen final no necesita `npm install`. |
| `npm ci` con `--mount=type=cache` y copia previa de `package*.json` | Instalación reproducible según el lockfile, con la capa y la caché de npm reutilizadas entre builds. |
| `libc6-compat` | Algunos binarios nativos (SWC, lightningcss) esperan glibc. Alpine usa musl. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` como **build arg** | Next incrusta las variables `NEXT_PUBLIC_*` en el JavaScript del navegador al compilar, así que deben existir en el build y no solo en ejecución. |
| `API_URL` como variable de **runtime** (en compose) | Solo la usa el servidor de Next. Se puede apuntar a otra API sin reconstruir la imagen. |
| Usuario sin privilegios `nextjs` (uid 1001) y archivos con `--chown` | El proceso no corre como `root`. |
| `NEXT_TELEMETRY_DISABLED=1`, `NODE_ENV=production`, `HOSTNAME=0.0.0.0` | Sin telemetría. Escucha en todas las interfaces para que Docker pueda publicar el puerto. |
| `HEALTHCHECK` contra `/login` | Una página que renderiza sin sesión y sin depender de datos sirve para comprobar que el servidor de Next está arriba. |
| `.dockerignore` excluye `node_modules`, `.next`, `.env*` | Evita copiar artefactos del host (que pueden ser de otro sistema operativo) y secretos. |

### `docker-compose.yml`

- **Una red bridge propia** (`tiendita-net`): los servicios se resuelven por nombre (`api`) y solo se publican los puertos necesarios (`3000` y `8000`).
- **Variables obligatorias con `${VAR:?mensaje}`**: si falta `APP_KEY` o alguna credencial de la base, `docker compose up` se detiene con un mensaje claro antes de crear los contenedores.
- **API sin estado**: `SESSION_DRIVER=array`, `CACHE_STORE=file`, `QUEUE_CONNECTION=sync`. La autenticación es por token, así que no se necesitan las tablas `sessions`, `cache` ni `jobs`, que no existen en Neon.
- **Sin contenedor de base de datos**: el esquema y los datos viven en Neon y los comparte todo el equipo. `RUN_MIGRATIONS=false` evita que las migraciones choquen con las tablas existentes.

---

## Notas de despliegue

- **Railway** construye `backend/Dockerfile` (Root Directory `/backend`) con las mismas variables del `.env.example`, y usa `/up` como healthcheck.
- **Vercel** compila el frontend desde `frontend/`. Requiere `API_URL` (URL pública de la API terminada en `/api`) y `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- Usa el **host directo de Neon**. Con el pooler (`-pooler`), las transacciones de Laravel al crear pedidos fallan con `SQLSTATE[25P02]`.
