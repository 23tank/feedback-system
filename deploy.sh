#!/bin/bash

# AWS EC2 Deployment Script for Feedback Management System
# Usage: ./deploy.sh

set -e

echo "🚀 Starting AWS EC2 deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on EC2
if ! curl -s http://169.254.169.254/latest/meta-data/instance-id > /dev/null 2>&1; then
    print_warning "This script is designed for AWS EC2. Make sure you're running it on an EC2 instance."
fi

# Update system packages
print_status "Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_status "Docker installed successfully"
else
    print_status "Docker already installed"
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully"
else
    print_status "Docker Compose already installed"
fi

# Install additional tools
print_status "Installing additional tools..."
sudo apt-get install -y curl wget git htop

# Create application directory
APP_DIR="/opt/feedback-system"
print_status "Setting up application directory at $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Copy application files (assuming this script is run from project root)
print_status "Copying application files..."
cp -r . $APP_DIR/
cd $APP_DIR

# Create production environment file
print_status "Creating production environment file..."
cat > .env.prod << EOF
# Database Configuration
DB_PASSWORD=SecurePassword123!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Application Configuration
NODE_ENV=production
VITE_API_BASE=http://localhost:4000
EOF

print_warning "Please update .env.prod with your actual passwords and secrets!"

# Set up SSL directory
print_status "Setting up SSL directory..."
sudo mkdir -p nginx/ssl
sudo chown $USER:$USER nginx/ssl

# Build and start services
print_status "Building and starting Docker services..."
docker-compose -f docker-compose.prod.yml down --remove-orphans
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
print_status "Waiting for services to start..."
sleep 30

# Check service status
print_status "Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Test API endpoint
print_status "Testing API endpoint..."
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    print_status "✅ API is responding"
else
    print_warning "⚠️  API might not be ready yet. Check logs with: docker-compose -f docker-compose.prod.yml logs"
fi

# Set up log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/docker-compose > /dev/null << EOF
/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF

# Create systemd service for auto-start
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/feedback-system.service > /dev/null << EOF
[Unit]
Description=Feedback Management System
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable feedback-system.service

print_status "✅ Deployment completed successfully!"
print_status "Your application should be available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
print_status ""
print_status "Useful commands:"
print_status "  View logs: docker-compose -f docker-compose.prod.yml logs -f"
print_status "  Restart: docker-compose -f docker-compose.prod.yml restart"
print_status "  Stop: docker-compose -f docker-compose.prod.yml down"
print_status "  Update: git pull && docker-compose -f docker-compose.prod.yml up -d --build"
