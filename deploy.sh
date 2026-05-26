#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Run this script ON your DigitalOcean Droplet to deploy/update
# Usage: bash deploy.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e  # Exit immediately if any command fails

PROJECT_DIR="/var/www/angkor-auto"
REPO_URL="https://github.com/YOUR_USERNAME/YOUR_REPO.git"   # ← Update with your repo URL

echo "🚀 Starting Angkor Auto Car Rental deployment..."

# ── 1. Pull latest code ───────────────────────────────────────────────────────
if [ -d "$PROJECT_DIR/.git" ]; then
  echo "📥 Pulling latest code..."
  cd "$PROJECT_DIR"
  # Fetch and reset to avoid merge conflicts on local server modifications
  git fetch --all
  git reset --hard origin/main
else
  echo "📥 Cloning repository..."
  git clone "$REPO_URL" "$PROJECT_DIR"
  cd "$PROJECT_DIR"
fi

# ── 2. Make sure .env.production exists ───────────────────────────────────────
if [ ! -f "$PROJECT_DIR/backend/.env.production" ]; then
  echo "❌ ERROR: backend/.env.production not found!"
  echo "   Please create it at: $PROJECT_DIR/backend/.env.production"
  echo "   Use backend/.env.production as a template and configure your production credentials."
  exit 1
fi

# ── 3. Rebuild and restart containers ─────────────────────────────────────────
echo "🐳 Building and starting Docker containers..."
docker compose build --no-cache
docker compose up -d --remove-orphans

# ── 4. Run Laravel post-deploy commands ───────────────────────────────────────
echo "⚙️  Running Laravel migrations and optimization..."

# Wait a few seconds for the database/app service to be fully responsive
sleep 5

docker compose exec -T app php artisan storage:link || true
docker compose exec -T app php artisan migrate --force

echo "⚡ Optimizing application cache..."
docker compose exec -T app php artisan config:cache
docker compose exec -T app php artisan route:cache
docker compose exec -T app php artisan view:cache
docker compose exec -T app php artisan cache:clear

echo ""
echo "✅ Deployment complete!"
echo "📍 Your app is now live at: http://$(curl -s https://ifconfig.me || hostname -I | awk '{print $1}')"
echo ""

