#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Run this script ON your DigitalOcean Droplet to deploy/update
# Usage: bash deploy.sh
# ─────────────────────────────────────────────────────────────────────────────

echo "⚡ Optimizing application cache..."
echo ""
set -euo pipefail

# Use the script directory as the project root so the script is portable
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"
REPO_URL="https://github.com/heisernbergg0942/Angkor-Auto-Car-rental.git"   # Automatically updated

echo "🚀 Starting Angkor Auto Car Rental deployment in: $PROJECT_DIR"

# 1. Ensure prerequisites
if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker not installed or not in PATH. Install Docker before running this script."
  exit 1
fi

if ! command -v docker-compose >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
  echo "❌ docker compose CLI not available. Install Docker Compose plugin."
  exit 1
fi

# 2. Pull latest code (keep working dir stable)
if [ -d "$PROJECT_DIR/.git" ]; then
  echo "📥 Pulling latest code..."
  git -C "$PROJECT_DIR" fetch --all --prune
  git -C "$PROJECT_DIR" reset --hard origin/main
else
  echo "📥 Cloning repository into $PROJECT_DIR..."
  git clone "$REPO_URL" "$PROJECT_DIR"
fi

# 3. Ensure production env exists
ENV_FILE="$PROJECT_DIR/backend/.env.production"
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ ERROR: backend/.env.production not found at $ENV_FILE"
  echo "   Create it (securely) before running this script. Example: copy backend/.env.example and fill secrets."
  exit 1
fi

# 4. Build and start containers
echo "🐳 Building and starting Docker containers..."
# Allow skipping rebuild by setting SKIP_BUILD=1 in the environment
if [ "${SKIP_BUILD:-0}" = "1" ]; then
  echo "🔁 Skipping image rebuild (SKIP_BUILD=1)"
else
  docker compose --env-file "$ENV_FILE" build --pull
fi
docker compose --env-file "$ENV_FILE" up -d --remove-orphans

# 5. If a 'db' service exists, wait until it reports healthy (if healthcheck is defined)
if docker compose --env-file "$ENV_FILE" ps -q db >/dev/null 2>&1; then
  echo "⏳ Waiting for database service 'db' to become healthy..."
  DB_CID=$(docker compose --env-file "$ENV_FILE" ps -q db)
  # check if health status is available
  if docker inspect --format='{{json .State.Health}}' "$DB_CID" >/dev/null 2>&1; then
    ATTEMPTS=0
    MAX_ATTEMPTS=40
    until [ "$(docker inspect --format='{{.State.Health.Status}}' "$DB_CID")" = "healthy" ] || [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; do
      ATTEMPTS=$((ATTEMPTS + 1))
      echo "  - waiting for db (attempt $ATTEMPTS/$MAX_ATTEMPTS)"
      sleep 3
    done
    if [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; then
      echo "⚠️  Database did not become healthy in time; continuing but migrations may fail."
    else
      echo "✅ Database is healthy."
    fi
  else
    echo "ℹ️  No healthcheck found for 'db' container; pausing briefly to allow DB to start..."
    sleep 8
  fi
fi

# Helper to run artisan inside the app container
artisan() {
  docker compose --env-file "$ENV_FILE" exec -T app php artisan "$@"
}

# 6. Ensure APP_KEY exists in the env inside container; generate if missing
echo "🔐 Ensuring APP_KEY is present..."
if ! grep -q '^APP_KEY=' "$ENV_FILE" || grep -q '^APP_KEY=$' "$ENV_FILE"; then
  echo "APP_KEY is empty in $ENV_FILE — generating inside container..."
  # Try to generate via artisan (writes to .env inside container volume)
  docker compose --env-file "$ENV_FILE" exec -T app php artisan key:generate --force || true
fi

echo "⚙️  Running Laravel storage link and migrations..."
docker compose --env-file "$ENV_FILE" exec -T app php artisan storage:link || true
docker compose --env-file "$ENV_FILE" exec -T app php artisan migrate --force

echo "⚡ Optimizing application cache..."
docker compose --env-file "$ENV_FILE" exec -T app php artisan config:cache || true
docker compose --env-file "$ENV_FILE" exec -T app php artisan route:cache || true
docker compose --env-file "$ENV_FILE" exec -T app php artisan view:cache || true
docker compose --env-file "$ENV_FILE" exec -T app php artisan cache:clear || true

echo ""
echo "✅ Deployment complete!"
IP=$(curl -s https://ifconfig.me || hostname -I | awk '{print $1}' || true)
echo "📍 Your app is now live at: http://$IP"
echo ""

