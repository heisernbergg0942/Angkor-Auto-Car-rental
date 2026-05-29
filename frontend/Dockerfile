# ─────────────────────────────────────────────────────────────────────────────
# frontend/Dockerfile
# Node 20 (build) + Nginx Alpine (serve)
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build the React/Vite app ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first for layer caching
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Copy source and build
ARG VITE_API_URL=https://angkorauto.work/api
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51TUnp36bk822pLYCkkn1VMveictXfQCMKzPhafT89HIA2sDJQoVo1PCdEPPHwpD8WmxhfZBdBIngH9Ov0nhrNbsW009ChvuaPs
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

COPY . .
RUN npm run build

# ── Stage 2: Serve via Nginx ───────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
