# Complete AWS EC2 Deployment Guide for VaultChain

## Overview
This guide will help you deploy your VaultChain application to AWS EC2 with:
- **Frontend**: `https://vaultchaintr.com`
- **Backend API**: `https://vaultchaintr.com/api`
- **Database**: SQLite (included in backend)

---

## Prerequisites

### AWS Setup
1. **EC2 Instance**
   - Launch an Ubuntu 22.04 LTS instance (t2.micro minimum, t2.small recommended)
   - Ensure your security group allows:
     - **HTTP (Port 80)** - For Let's Encrypt SSL
     - **HTTPS (Port 443)** - For your website
     - **SSH (Port 22)** - For server access
     - Remove port 3001 from public access (only internal Nginx → Backend)

2. **Domain & DNS**
   - Point `vaultchaintr.com` A record to your EC2 instance **public IP**
   - Point `www.vaultchaintr.com` A record to the same IP (or CNAME to main domain)
   - Wait for DNS propagation (can take up to 48 hours, usually faster)

3. **SSH Access**
   - Download your EC2 key pair (.pem file)
   - Set permissions: `chmod 400 your-key.pem` (Mac/Linux) or use PuTTY (Windows)

---

## Step-by-Step Deployment

### Step 1: Connect to Your EC2 Instance

```bash
# Linux/Mac
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Windows (use PowerShell or WSL)
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 2: Install System Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y build-essential curl git

# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
node --version  # Should show v18.x.x or higher
npm --version

# Install PM2 (process manager for Node.js)
sudo npm install -g pm2

# Install Nginx (web server)
sudo apt install -y nginx

# Install Certbot for SSL certificates
sudo apt install -y certbot python3-certbot-nginx

# Enable PM2 to start on boot
pm2 startup systemd
# Run the command it outputs (usually starts with "sudo env PATH=...")
```

### Step 3: Upload Your Application

#### Option A: Using Git (Recommended)
```bash
# If your code is in a Git repository
cd ~
git clone YOUR_REPO_URL vaultchain
cd vaultchain
```

#### Option B: Using SCP from Local Machine
```bash
# From your LOCAL machine (Windows/Mac/Linux)
# Make sure you're in the vaultchain directory
scp -i your-key.pem -r . ubuntu@YOUR_EC2_PUBLIC_IP:~/vaultchain
```

#### Option C: Using FileZilla/WinSCP
- Connect via SFTP using your EC2 IP, username (ubuntu), and key file
- Upload the entire vaultchain directory

### Step 4: Setup Backend

```bash
cd ~/vaultchain/backend

# Install backend dependencies
npm install --production

# Create .env file for environment variables
nano .env
```

**Add the following to `.env` file:**
```env
# Server Configuration
PORT=3001
NODE_ENV=production
HOST=0.0.0.0

# CORS (if needed to override)
CORS_ORIGIN=https://vaultchaintr.com

# Email Configuration (Required for password reset and OTP)
# For Gmail: Use App Password (not regular password)
# Settings: https://myaccount.google.com/apppasswords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# Gemini AI API (for financial assistant)
GEMINI_API_KEY=your-gemini-api-key-here
```

**Save the file:** Press `Ctrl+X`, then `Y`, then `Enter`

```bash
# Create logs directory for PM2
mkdir -p logs

# Start backend with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check backend status
pm2 status
pm2 logs vaultchain-backend  # View logs (Ctrl+C to exit)
```

**Test backend locally:**
```bash
curl http://localhost:3001/api/data
# Should return JSON data
```

### Step 5: Build Frontend

```bash
cd ~/vaultchain

# Install frontend dependencies
npm install

# Create .env.local file if you need to set GEMINI_API_KEY for frontend
# (The API key is used in backend, but can be set here for frontend if needed)
nano .env.local
```

**Add if needed:**
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

```bash
# Build frontend for production
npm run build

# This creates a 'dist' folder with production-ready files
```

### Step 6: Configure Nginx

```bash
# Create Nginx configuration file
sudo nano /etc/nginx/sites-available/vaultchaintr.com
```

**Paste this configuration (IMPORTANT: Update paths if different):**
```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name vaultchaintr.com www.vaultchaintr.com;
    
    # For Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other HTTP traffic to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS Server Block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name vaultchaintr.com www.vaultchaintr.com;

    # SSL Certificate (Let's Encrypt - will be set up in next step)
    ssl_certificate /etc/letsencrypt/live/vaultchaintr.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vaultchaintr.com/privkey.pem;
    
    # SSL Configuration (best practices)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend files location
    root /home/ubuntu/vaultchain/dist;
    index index.html;

    # Translations JSON files - IMPORTANT: Must come BEFORE location /
    location /translations/ {
        root /home/ubuntu/vaultchain/dist;
        default_type application/json;
        add_header Content-Type application/json;
        expires 1h;
        add_header Cache-Control "public, max-age=3600";
        try_files $uri =404;
    }

    # Backend API - Proxies to internal backend server
    # External URL: https://vaultchaintr.com/api
    # Internal connection: http://127.0.0.1:3001
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        
        # Headers for proper proxying
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Timeouts
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        proxy_send_timeout 300s;
    }

    # Frontend (React/Vite build) - This comes LAST as fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /home/ubuntu/vaultchain/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/vaultchaintr.com /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx
```

### Step 7: Setup SSL Certificate with Let's Encrypt

**IMPORTANT:** Make sure your DNS is pointing to your EC2 instance before running this!

```bash
# Request SSL certificate
sudo certbot --nginx -d vaultchaintr.com -d www.vaultchaintr.com

# Follow the prompts:
# 1. Enter your email address
# 2. Agree to terms of service (A)
# 3. Choose to redirect HTTP to HTTPS (2)
```

**Certbot will automatically:**
- Generate SSL certificates
- Update your Nginx configuration
- Set up auto-renewal

**Test auto-renewal:**
```bash
sudo certbot renew --dry-run
```

### Step 8: Configure Firewall

```bash
# Enable UFW (Uncomplicated Firewall)
sudo ufw allow 'Nginx Full'
sudo ufw allow 'OpenSSH'
sudo ufw enable

# Verify firewall status
sudo ufw status
```

### Step 9: Test Your Deployment

1. **Test Backend API:**
   ```bash
   curl https://vaultchaintr.com/api/data
   # Should return JSON data
   ```

2. **Test Frontend:**
   - Open browser: `https://vaultchaintr.com`
   - Should see your application

3. **Check Logs:**
   ```bash
   # Backend logs
   pm2 logs vaultchain-backend
   
   # Nginx error logs
   sudo tail -f /var/log/nginx/error.log
   
   # Nginx access logs
   sudo tail -f /var/log/nginx/access.log
   ```

---

## Configuration Files Checklist

### ✅ Already Configured (No Changes Needed):
- ✅ `services/api.ts` - API_BASE_URL is set to `https://vaultchaintr.com/api`
- ✅ `backend/server.js` - Listens on `0.0.0.0:3001` (correct for EC2)
- ✅ `backend/app.js` - CORS includes `https://vaultchaintr.com`
- ✅ `backend/ecosystem.config.js` - PM2 configuration ready
- ✅ `nginx-config-vaultchaintr.com-ssl.conf` - SSL config template available

### ⚠️ Files You Need to Create/Update:

1. **`backend/.env`** - Create this file with your environment variables (Step 4)
2. **`.env.local`** (optional) - For frontend environment variables if needed

---

## Updating Your Application

### Quick Update Script

Create a file `~/vaultchain/deploy.sh`:

```bash
#!/bin/bash
cd ~/vaultchain

echo "Updating backend..."
cd backend
git pull  # or upload new files
npm install --production
pm2 restart vaultchain-backend

echo "Updating frontend..."
cd ..
npm install
npm run build

echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "✅ Deployment complete!"
```

Make it executable:
```bash
chmod +x ~/vaultchain/deploy.sh
```

Run updates:
```bash
~/vaultchain/deploy.sh
```

### Manual Update

```bash
# Backend
cd ~/vaultchain/backend
# Upload new files or: git pull
npm install --production
pm2 restart vaultchain-backend
pm2 logs vaultchain-backend  # Check for errors

# Frontend
cd ~/vaultchain
# Upload new files or: git pull
npm install
npm run build
sudo systemctl restart nginx
```

---

## Troubleshooting

### Website Not Loading

1. **Check DNS:**
   ```bash
   nslookup vaultchaintr.com
   # Should show your EC2 IP
   ```

2. **Check Security Group:**
   - AWS Console → EC2 → Security Groups
   - Ensure ports 80, 443 are open to 0.0.0.0/0

3. **Check Nginx:**
   ```bash
   sudo systemctl status nginx
   sudo nginx -t  # Test configuration
   ```

4. **Check Firewall:**
   ```bash
   sudo ufw status
   ```

### API Not Working

1. **Check Backend:**
   ```bash
   pm2 status
   pm2 logs vaultchain-backend
   ```

2. **Test Backend Locally:**
   ```bash
   curl http://localhost:3001/api/data
   ```

3. **Check Nginx Proxy:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Check CORS:**
   - Verify `backend/app.js` has `https://vaultchaintr.com` in allowed origins

### SSL Certificate Issues

1. **Check DNS:**
   ```bash
   dig vaultchaintr.com
   # Should show your EC2 IP
   ```

2. **Verify Certificate:**
   ```bash
   sudo certbot certificates
   ```

3. **Renew Certificate:**
   ```bash
   sudo certbot renew
   ```

### Database Issues

1. **Check Database Location:**
   ```bash
   ls -la ~/vaultchain/backend/database.db
   ```

2. **Check Permissions:**
   ```bash
   ls -la ~/vaultchain/backend/database.db
   # Should be readable/writable
   ```

### Email Not Sending

1. **Check Environment Variables:**
   ```bash
   cat ~/vaultchain/backend/.env
   ```

2. **Test Email Configuration:**
   ```bash
   cd ~/vaultchain/backend
   node test-email.js
   ```

3. **For Gmail:** Use App Passwords, not regular password
   - Go to: https://myaccount.google.com/apppasswords
   - Generate app-specific password

---

## Useful Commands Reference

```bash
# PM2 Commands
pm2 status                    # View all processes
pm2 logs vaultchain-backend   # View backend logs
pm2 restart vaultchain-backend # Restart backend
pm2 stop vaultchain-backend   # Stop backend
pm2 delete vaultchain-backend # Remove from PM2

# Nginx Commands
sudo systemctl status nginx   # Check Nginx status
sudo systemctl restart nginx  # Restart Nginx
sudo systemctl reload nginx   # Reload configuration
sudo nginx -t                 # Test configuration
sudo tail -f /var/log/nginx/error.log   # View errors
sudo tail -f /var/log/nginx/access.log  # View access logs

# SSL/Certbot Commands
sudo certbot certificates      # List certificates
sudo certbot renew            # Renew certificates
sudo certbot renew --dry-run  # Test renewal

# System Commands
df -h                         # Check disk space
free -h                       # Check memory
top                           # Monitor system resources
```

---

## Security Best Practices

1. **Keep System Updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Regular Backups:**
   - Backup database: `cp ~/vaultchain/backend/database.db ~/backups/database-$(date +%Y%m%d).db`
   - Consider automated backups to S3

3. **Firewall:**
   - Only allow necessary ports (80, 443, 22)
   - Do NOT expose port 3001 publicly

4. **Environment Variables:**
   - Never commit `.env` files to Git
   - Use strong passwords and API keys

5. **PM2 Monitoring:**
   - Monitor logs regularly: `pm2 logs`
   - Set up PM2 monitoring: `pm2 install pm2-logrotate`

---

## Next Steps After Deployment

1. ✅ Test all features (login, signup, transactions, etc.)
2. ✅ Set up automated backups
3. ✅ Monitor logs for errors
4. ✅ Set up uptime monitoring (e.g., UptimeRobot)
5. ✅ Configure domain email (for SMTP using your domain)

---

## Support

If you encounter issues:
1. Check logs first: `pm2 logs` and `sudo tail -f /var/log/nginx/error.log`
2. Verify DNS propagation
3. Check security group settings
4. Review this guide step by step

---

**Deployment Date:** _______________
**EC2 Instance:** _________________
**Domain:** vaultchaintr.com

