# ---- Build stage ----
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
# NEXT_PUBLIC_SITE_URL can be baked in at build time:
# docker build --build-arg NEXT_PUBLIC_SITE_URL=https://dl.example.com .
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
RUN npm run build

# ---- Runtime stage (no system dependencies: live conversion is pure JS) ----
FROM node:20-slim AS runner
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
