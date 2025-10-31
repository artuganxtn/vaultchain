# VaultChain AWS EC2 Deployment Guide

This guide will help you deploy your VaultChain application to AWS EC2 instance with the domain `vaultchaintr.com`.

## Prerequisites

- AWS Account with EC2 access
- Domain name `vaultchaintr.com` configured
- SSH key pair for EC2 access
- Basic knowledge of Linux commands

---

## Step 1: Create and Launch EC2 Instance

1. **Go to AWS Console → EC2 Dashboard**
2. **Click "Launch Instance"**
3. **Configure Instance:**
   - **Name:** `vaultchain-server`
   - **AMI:** Ubuntu 22.04 LTS (or latest)
   - **Instance Type:** `t3.medium` or `t3.large` (recommended)
   - **Key Pair:** Create new or select existing
   - **Network Settings:**
     - Allow HTTP (Port 80)
     - Allow HTTPS (Port 443)
     - Allow Custom TCP Port 3001 (for backend API)
     - Allow SSH (Port 22) - from your IP only
   - **Storage:** 20 GB minimum
4. **Launch Instance**

---

## Step 2: Configure Domain DNS

1. **Go to your domain registrar** (where you bought `vaultchaintr.com`)
2. **Update DNS Records:**
   - **A Record:** `@` → Your EC2 Public IP
   - **A Record:** `www` → Your EC2 Public IP
   - **A Record:** `api` → Your EC2 Public IP (optional, for API subdomain)

Wait 5-10 minutes for DNS propagation.

---

## Step 3: Connect to EC2 Instance

```bash
# Replace with your key file and EC2 IP
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

---

## Step 4: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y build-essential curl git nginx certbot python3-certbot-nginx

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
node --version  # Should show v18.x
npm --version
nginx -v
```

---

## Step 5: Setup PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start PM2 on system boot
pm2 startup systemd
# Follow the command it outputs (usually: sudo env PATH=...)
```

---

## Step 6: Clone and Setup Backend

```bash
# Create app directory
cd ~
mkdir -p vaultchain-app
cd vaultchain-app

# Upload your project files (Option 1: Using Git)
git clone your-repository-url backend
cd backend

# OR (Option 2: Using SCP from your local machine)
# scp -i your-key.pem -r /path/to/vaultchain/backend ubuntu@your-ec2-ip:~/vaultchain-app/

# Install backend dependencies
cd backend
npm install --production

# Create .env file
nano .env
```

**Add to `.env`:**
```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://vaultchaintr.com

# Database (SQLite - already included, or configure PostgreSQL if preferred)
DATABASE_PATH=./database.db

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@vaultchaintr.com
SMTP_PASSWORD=your-app-password

# CORS (if needed)
CORS_ORIGIN=https://vaultchaintr.com
```

Save and exit (Ctrl+X, then Y, then Enter)

---

## Step 7: Setup Frontend

```bash
# Navigate to root
cd ~/vaultchain-app

# Upload frontend files
# Option 1: Using Git (if frontend is in same repo)
# Option 2: Using SCP
# scp -i your-key.pem -r /path/to/vaultchain/* ubuntu@your-ec2-ip:~/vaultchain-app/frontend/

# Install frontend dependencies
cd frontend
npm install

# Build for production
npm run build

# The dist folder now contains your production build
```

**Update frontend API configuration:**

Edit `vite.config.ts` or `config.ts` to use production API URL:
```typescript
// In services/api.ts or config.ts
export const API_BASE_URL = 'https://vaultchaintr.com/api';
```

Rebuild:
```bash
npm run build
```

---

## Step 8: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/vaultchaintr.com
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name vaultchaintr.com www.vaultchaintr.com;

    # Frontend (React/Vite build)
    location / {
        root /home/ubuntu/vaultchain-app/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/vaultchaintr.com /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Step 9: Setup SSL Certificate (HTTPS)

```bash
# Obtain SSL certificate using Let's Encrypt
sudo certbot --nginx -d vaultchaintr.com -d www.vaultchaintr.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose redirect HTTP to HTTPS

# Auto-renewal is set up automatically
# Test renewal: sudo certbot renew --dry-run
```

---

## Step 10: Start Backend with PM2

```bash
cd ~/vaultchain-app/backend

# Create PM2 ecosystem file
nano ecosystem.config.js
```

**Add to `ecosystem.config.js`:**
```javascript
module.exports = {
  apps: [{
    name: 'vaultchain-backend',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
```

```bash
# Create logs directory
mkdir -p logs

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs vaultchain-backend
```

---

## Step 11: Configure Firewall (UFW)

```bash
# Allow Nginx
sudo ufw allow 'Nginx Full'
sudo ufw allow 'OpenSSH'
sudo ufw enable

# Check status
sudo ufw status
```

---

## Step 12: Update Frontend API Base URL

Make sure your frontend points to the production API. Update `services/api.ts`:

```typescript
export const API_BASE_URL = typeof window !== 'undefined' 
  ? (location.hostname === 'vaultchaintr.com' || location.hostname === 'www.vaultchaintr.com'
      ? 'https://vaultchaintr.com/api'
      : 'http://localhost:3001/api')
  : '/api';
```

Rebuild frontend:
```bash
cd ~/vaultchain-app/frontend
npm run build
```

---

## Step 13: Test Your Deployment

1. **Visit:** `https://vaultchaintr.com`
2. **Check:**
   - Frontend loads correctly
   - API endpoints work (`https://vaultchaintr.com/api/data`)
   - SSL certificate is valid (green lock icon)
   - Signup and OTP verification work

---

## Useful Commands

### PM2 Management
```bash
pm2 status                    # Check app status
pm2 logs vaultchain-backend   # View logs
pm2 restart vaultchain-backend # Restart app
pm2 stop vaultchain-backend   # Stop app
pm2 monit                     # Monitor resources
```

### Nginx Management
```bash
sudo systemctl status nginx   # Check status
sudo systemctl restart nginx  # Restart
sudo nginx -t                 # Test config
sudo tail -f /var/log/nginx/error.log  # View error logs
```

### Application Logs
```bash
# Backend logs
pm2 logs vaultchain-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### 1. **Cannot access the website**
- Check security group allows HTTP (80) and HTTPS (443)
- Check DNS has propagated: `nslookup vaultchaintr.com`
- Check Nginx is running: `sudo systemctl status nginx`

### 2. **API not working**
- Check backend is running: `pm2 status`
- Check backend logs: `pm2 logs vaultchain-backend`
- Check Nginx proxy configuration
- Test backend directly: `curl http://localhost:3001/api/data`

### 3. **SSL Certificate issues**
- Ensure domain DNS is pointing to EC2 IP
- Wait for DNS propagation (can take up to 48 hours)
- Check certificate: `sudo certbot certificates`

### 4. **Database issues**
- Ensure `database.db` file has correct permissions
- Check database location in `.env`

### 5. **Email not sending**
- Verify SMTP credentials in `.env`
- Check email service logs
- Test email: `cd backend && node test-email.js`

---

## Security Recommendations

1. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use strong passwords** for all services

3. **Regular backups:**
   ```bash
   # Backup database
   cp backend/database.db backups/database-$(date +%Y%m%d).db
   ```

4. **Monitor logs regularly**

5. **Set up CloudWatch** for monitoring (optional)

6. **Configure SSH key-only access** (disable password auth)

---

## Production Checklist

- [ ] EC2 instance created and running
- [ ] Domain DNS configured and propagated
- [ ] Node.js and dependencies installed
- [ ] Backend `.env` file configured
- [ ] Frontend built and deployed
- [ ] Nginx configured and running
- [ ] SSL certificate installed
- [ ] PM2 managing backend process
- [ ] Firewall configured
- [ ] Application tested and working
- [ ] Email functionality tested
- [ ] OTP verification tested
- [ ] Logs accessible
- [ ] Backups configured

---

## Quick Update Deployment

When you need to update the application:

```bash
# 1. Pull latest changes (if using Git)
cd ~/vaultchain-app/backend
git pull origin main

# OR upload new files via SCP

# 2. Install new dependencies (if any)
npm install --production

# 3. Restart backend
pm2 restart vaultchain-backend

# 4. Update frontend
cd ~/vaultchain-app/frontend
# Upload new files or git pull
npm install
npm run build

# 5. Restart Nginx
sudo systemctl restart nginx
```

---

## Support

For issues, check:
- PM2 logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/`
- Backend logs: `~/vaultchain-app/backend/logs/`

Good luck with your deployment! 🚀

