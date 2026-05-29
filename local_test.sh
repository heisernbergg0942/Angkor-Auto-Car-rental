#!/usr/bin/env bash
set -euo pipefail

# --------------------------------------------------------------
# local_test.sh – full local sanity‑check for Angkor‑Auto‑Car‑rental
# --------------------------------------------------------------

# 0️⃣ Ensure required directories exist
mkdir -p frontend/docker

# 1️⃣ Spin up a local PostgreSQL instance (if it does not already exist)
if ! docker ps --format '{{.Names}}' | grep -q '^local_pg$'; then
  echo "⏳ Starting a temporary local Postgres container..."
  docker run -d --name local_pg \
    -e POSTGRES_PASSWORD=secret \
    -e POSTGRES_DB=angkor \
    -p 5440:5432 \
    postgres:16-alpine >/dev/null
  # Wait a few seconds for the DB to become ready
  sleep 8
fi

# 2️⃣ Create a Docker Compose override file to force the app to use the local DB
cat > docker-compose.override.yml <<'EOL'
services:
  app:
    environment:
      DB_CONNECTION: pgsql
      DB_HOST: host.docker.internal
      DB_PORT: 5440
      DB_DATABASE: angkor
      DB_USERNAME: postgres
      DB_PASSWORD: secret
      DB_SSLMODE: disable
EOL

# 3️⃣ Generate dummy SSL certs for local testing so Nginx doesn't crash
mkdir -p certs/live/angkorauto.work
if [ ! -f certs/live/angkorauto.work/fullchain.pem ]; then
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout certs/live/angkorauto.work/privkey.pem \
    -out certs/live/angkorauto.work/fullchain.pem \
    -subj "/CN=angkorauto.work"
fi

# 4️⃣ Bring up the services **without** the edge Nginx
docker compose up -d app frontend backend_nginx redis certbot

# 5️⃣ Wait for certbot (we can skip this wait since we made dummy certs, but we'll keep a short wait for other services)
echo "⏳ Waiting for services to initialize..."
sleep 5

# 6️⃣ Now start the edge Nginx
docker compose up -d nginx
sleep 5

# 7️⃣ Show container status
docker compose ps

# 8️⃣ Laravel sanity checks (version + migration status)
docker compose exec -T app php artisan --version
docker compose exec -T app php artisan migrate --force
docker compose exec -T app php artisan migrate:status || echo "⚠️ Migration check failed – DB connection issue."

# 9️⃣ Quick HTTP health‑check
curl -k -s -o /dev/null -w "HTTP status: %{http_code}\n" https://localhost
