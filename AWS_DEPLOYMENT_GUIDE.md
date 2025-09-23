# AWS EC2 Deployment Guide for Feedback Management System

This guide will walk you through deploying your full-stack Feedback Management System to AWS EC2 using Docker Compose.

## Prerequisites

- AWS Account
- Basic knowledge of AWS EC2
- Your project code ready for deployment

## Step 1: Launch EC2 Instance

### 1.1 Create EC2 Instance

1. **Login to AWS Console** → EC2 Dashboard
2. **Click "Launch Instance"**
3. **Configure Instance:**
   - **Name:** `feedback-system-server`
   - **AMI:** Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type:** t2.micro (Free tier) or t3.small (recommended)
   - **Key Pair:** Create new or use existing
   - **Security Group:** Create new with these rules:
     - **SSH (22):** Your IP
     - **HTTP (80):** 0.0.0.0/0
     - **HTTPS (443):** 0.0.0.0/0 (optional for SSL)

### 1.2 Configure Security Group

```bash
# Inbound Rules:
Type: SSH, Port: 22, Source: Your IP
Type: HTTP, Port: 80, Source: 0.0.0.0/0
Type: HTTPS, Port: 443, Source: 0.0.0.0/0
```

## Step 2: Connect to EC2 Instance

### 2.1 SSH Connection

```bash
# Replace with your key file and instance IP
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

### 2.2 Update System

```bash
sudo apt update && sudo apt upgrade -y
```

## Step 3: Install Docker and Docker Compose

### 3.1 Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Logout and login again, or run:
newgrp docker
```

### 3.2 Install Docker Compose

```bash
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Step 4: Deploy Your Application

### 4.1 Upload Your Code

**Option A: Using Git (Recommended)**
```bash
# Clone your repository
git clone https://github.com/yourusername/feedback-system.git
cd feedback-system
```

**Option B: Using SCP**
```bash
# From your local machine
scp -i "your-key.pem" -r ./Feedbackprojectcurs ubuntu@your-ec2-ip:/home/ubuntu/
```

### 4.2 Set Up Environment

```bash
# Create production environment file
cat > .env.prod << EOF
# Database Configuration
DB_PASSWORD=SecurePassword123!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Application Configuration
NODE_ENV=production
VITE_API_BASE=http://localhost:4000
EOF
```

### 4.3 Deploy with Docker Compose

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

**Or manually:**

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml down --remove-orphans
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

## Step 5: Configure Domain (Optional)

### 5.1 Using Route 53

1. **Register Domain** in Route 53
2. **Create A Record** pointing to your EC2 public IP
3. **Update Security Group** to allow HTTPS traffic

### 5.2 SSL Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 6: Monitoring and Maintenance

### 6.1 View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### 6.2 Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

### 6.3 Backup Database

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec db mysqldump -u root -p feedback_system > backup.sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T db mysql -u root -p feedback_system < backup.sql
```

## Step 7: Security Best Practices

### 7.1 Firewall Configuration

```bash
# Install UFW
sudo apt install ufw -y

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 7.2 Environment Security

```bash
# Secure environment file
chmod 600 .env.prod

# Use strong passwords
# Generate random JWT secret
openssl rand -base64 32
```

## Step 8: Performance Optimization

### 8.1 Resource Limits

Add to `docker-compose.prod.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### 8.2 Database Optimization

```bash
# Add to MySQL configuration
echo "[mysqld]
innodb_buffer_pool_size = 256M
max_connections = 100" | sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf
```

## Troubleshooting

### Common Issues

1. **Port 80 already in use:**
   ```bash
   sudo lsof -i :80
   sudo kill -9 <PID>
   ```

2. **Docker permission denied:**
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **Database connection failed:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs db
   ```

4. **Out of memory:**
   ```bash
   # Check memory usage
   free -h
   # Consider upgrading instance type
   ```

### Useful Commands

```bash
# Check all containers
docker ps -a

# Check resource usage
docker stats

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# View real-time logs
docker-compose -f docker-compose.prod.yml logs -f --tail=100

# Clean up unused images
docker system prune -a
```

## Cost Optimization

### Free Tier Usage
- **t2.micro:** 750 hours/month free
- **EBS Storage:** 30 GB free
- **Data Transfer:** 1 GB/month free

### Cost Monitoring
1. Set up **AWS Budgets** for cost alerts
2. Use **CloudWatch** for monitoring
3. Consider **Spot Instances** for development

## Production Checklist

- [ ] Strong passwords in `.env.prod`
- [ ] SSL certificate configured
- [ ] Firewall rules configured
- [ ] Database backups scheduled
- [ ] Monitoring set up
- [ ] Log rotation configured
- [ ] Auto-restart on failure
- [ ] Domain name configured
- [ ] Security headers enabled

## Support

If you encounter issues:

1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify security groups in AWS Console
3. Ensure all ports are open
4. Check EC2 instance status
5. Verify environment variables

Your Feedback Management System should now be running at:
`http://your-ec2-public-ip` or `https://yourdomain.com`
