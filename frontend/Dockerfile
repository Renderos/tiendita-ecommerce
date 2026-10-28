# syntax=docker/dockerfile:1

############################################
# Etapa 1: dependencias de npm
############################################
FROM node:20-alpine AS deps
WORKDIR /app

# libc6-compat: binarios nativos (SWC, lightningcss) compilados contra glibc
RUN apk add --no-cache libc6-compat

# Solo los manifiestos: esta capa se reutiliza mientras no cambie package-lock.json
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

############################################
# Etapa 2: build de producción (next build)
############################################
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Las variables NEXT_PUBLIC_* se incrustan en el JS del navegador durante el build,
# por eso llegan como build arg y no como variable de runtime
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

############################################
# Etapa 3: imagen final de ejecución
############################################
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Usuario sin privilegios para ejecutar el servidor
RUN addgroup -S -g 1001 nodejs \
    && adduser -S -u 1001 -G nodejs nextjs

# Solo la salida standalone (server.js + node_modules mínimos), los assets estáticos y public/
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1:3000/login || exit 1

CMD ["node", "server.js"]
