#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────────────────────
# Silabuys Production Deploy Script
# Usage: ./deploy.sh [--ssl]
# ─────────────────────────────────────────────────────────────────────────────

COMPOSE="docker compose -f docker-compose.prod.yml"

echo "==> Pulling latest code..."
git pull origin main

echo "==> Checking .env file..."
if [ ! -f .env ]; then
    echo "ERROR: .env file not found. Copy .env.example to .env and fill in values."
    exit 1
fi

# SSL setup (first time only)
if [ "$1" == "--ssl" ]; then
    echo "==> Setting up SSL certificates..."
    $COMPOSE --profile ssl run --rm certbot
fi

echo "==> Building images..."
$COMPOSE build --no-cache

echo "==> Stopping old containers..."
$COMPOSE down --remove-orphans

echo "==> Starting services..."
$COMPOSE up -d

echo "==> Waiting for backend to be healthy..."
for i in {1..30}; do
    if curl -sf http://localhost/health > /dev/null 2>&1; then
        echo "==> Backend is healthy!"
        break
    fi
    echo "   Waiting... ($i/30)"
    sleep 3
done

echo "==> Cleaning up old Docker images..."
docker image prune -f

echo ""
echo "✓ Deploy complete!"
echo "  Frontend: https://${DOMAIN:-localhost}"
echo "  API Docs: disabled in production"
echo "  Health:   https://${DOMAIN:-localhost}/health"
