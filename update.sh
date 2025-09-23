#!/bin/bash

# Update script for AWS EC2 deployment
# Usage: ./update.sh

set -e

echo "🔄 Updating Feedback Management System..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Backup database before update
print_status "Creating database backup..."
docker-compose -f docker-compose.prod.yml exec db mysqldump -u root -p${DB_PASSWORD} feedback_system > backup_$(date +%Y%m%d_%H%M%S).sql

# Pull latest changes
print_status "Pulling latest changes..."
git pull origin main

# Stop services
print_status "Stopping services..."
docker-compose -f docker-compose.prod.yml down

# Rebuild and start
print_status "Rebuilding and starting services..."
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
print_status "Waiting for services to start..."
sleep 30

# Check status
print_status "Checking service status..."
docker-compose -f docker-compose.prod.yml ps

print_status "✅ Update completed successfully!"
