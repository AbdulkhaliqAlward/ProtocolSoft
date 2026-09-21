# Multi-stage image for both services (APP=cms|web) — one codebase, two containers (Phase 1 §11.2).
# The web variant contains no DB client libs beyond what Next.js ships; credential
# isolation is enforced by env + `verify:no-db` + network policy, not just by image.

ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/
COPY apps/cms/package.json apps/cms/
COPY apps/web/package.json apps/web/
RUN npm ci --ignore-scripts || npm install --ignore-scripts

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/cms ./apps/cms
COPY apps/web ./apps/web
# Build args supply NON-SECRET build-time values only (URLs); secrets stay runtime-only.
ARG SERVICE
ARG CMS_INTERNAL_URL=http://cms:3001
ARG WEB_INTERNAL_URL=http://web:3000
ARG NEXT_PUBLIC_SITE_URL=https://protosoftdev.com
ENV CMS_INTERNAL_URL=${CMS_INTERNAL_URL} WEB_INTERNAL_URL=${WEB_INTERNAL_URL} NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
RUN if [ "$SERVICE" = "web" ]; then npm run build -w @protocol-soft/web; else npm run build -w @protocol-soft/cms; fi

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder --chown=app:app /app ./
ARG SERVICE
ENV SERVICE=${SERVICE}
USER app
EXPOSE 3000 3001
# Health checks: web -> /api/health (added Phase 6), cms -> /api/internal/health
CMD ["sh", "-c", "if [ \"$SERVICE\" = \"web\" ]; then npm run start -w @protocol-soft/web; else npm run start -w @protocol-soft/cms; fi"]
