#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Run this script ON your DigitalOcean Droplet to deploy/update
# Usage: bash deploy.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e  # Exit immediately if any command fails

PROJECT_DIR="/var/www/angkor-auto"
REPO_URL="https://github.com/YOUR_USERNAME/YOUR_REPO.git"   # ← Change this

echo "🚀 Starting Angkor Auto deployment..."

# ── 1. Pull latest code ───────────────────────────────────────────────────────
if [ -d "$PROJECT_DIR/.git" ]; then
  echo "📥 Pulling latest code..."
  cd "$PROJECT_DIR"
  git pull origin main
else
  echo "📥 Cloning repository..."
  git clone "$REPO_URL" "$PROJECT_DIR"
  cd "$PROJECT_DIR"
fi

# ── 2. Make sure .env.production exists ───────────────────────────────────────
if [ ! -f "$PROJECT_DIR/backend/.env.production" ]; then
  echo "❌ ERROR: backend/.env.production not found!"
  echo "   Please create it from backend/.env.production (template) and fill in all values."
  exit 1
fi

# ── 3. Rebuild and restart containers ─────────────────────────────────────────
echo "🐳 Building Docker images..."
docker compose build --no-cache

echo "⬆️  Starting containers..."
docker compose up -d --remove-orphans

# ── 4. Run Laravel post-deploy commands ───────────────────────────────────────
echo "⚙️  Running Laravel migrations and cache..."
docker compose exec app php artisan migrate --force
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
docker compose exec app php artisan view:cache
docker compose exec app php artisan storage:link

# ── 5. Clear old cache ────────────────────────────────────────────────────────
docker compose exec app php artisan cache:clear

echo ""
echo "✅ Deployment complete! Your app is live at http://$(hostname -I | awk '{print $1}')"
echo ""
