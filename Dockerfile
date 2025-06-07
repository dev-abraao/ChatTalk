# syntax=docker.io/docker/dockerfile:1

FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 👇 Apenas para debug - garante que o schema realmente existe antes de gerar
RUN ls -la prisma && cat prisma/schema.prisma

# 👇 Geração do Prisma Client
RUN npx prisma generate

# 👇 Definir variável de ambiente para o build do Next.js
ARG NEXT_PUBLIC_ABLY_API_KEY
ENV NEXT_PUBLIC_ABLY_API_KEY=${NEXT_PUBLIC_ABLY_API_KEY}

RUN echo "=== DEBUGGING ENVIRONMENT VARIABLES ==="
RUN echo "NEXT_PUBLIC_ABLY_API_KEY: ${NEXT_PUBLIC_ABLY_API_KEY:-NOT_SET}"
RUN env | grep NEXT_PUBLIC || echo "No NEXT_PUBLIC vars found"

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# 👇 Redefinir variável para o runtime do Next.js standalone
ARG NEXT_PUBLIC_ABLY_API_KEY
ENV NEXT_PUBLIC_ABLY_API_KEY=${NEXT_PUBLIC_ABLY_API_KEY}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
