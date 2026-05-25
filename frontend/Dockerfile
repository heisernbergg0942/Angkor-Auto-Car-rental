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
# VITE_API_URL is injected at build time via --build-arg
ARG VITE_API_URL=http://localhost/api
ENV VITE_API_URL=$VITE_API_URL

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
