<<<<<<< HEAD
# VaultChain Deployment Guide

Complete step-by-step guide to deploy VaultChain on AWS EC2.

## 📋 Prerequisites

- AWS EC2 instance (Ubuntu 20.04 or 22.04 recommended)
- Domain name: `vaultchaintr.com` pointing to your EC2 IP
- SSH access to your EC2 instance
- Basic knowledge of Linux commands

---

## 🚀 Step 1: Connect to Your EC2 Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

---

## 🔧 Step 2: Initial Server Setup

### 2.1 Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 2.2 Install Required Software

```bash
# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git

# Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx

# Install UFW (Firewall)
sudo apt install -y ufw
```

### 2.3 Configure Firewall

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 📦 Step 3: Clone and Setup Project

### 3.1 Clone Repository

```bash
# Create apps directory
sudo mkdir -p /var/www
cd /var/www

# Clone your repository
sudo git clone https://github.com/artuganxtn/vaultchain.git
# OR upload your project files via SCP/SFTP

# Set ownership
sudo chown -R $USER:$USER /var/www/vaultchain
cd vaultchain
```

### 3.2 Install Frontend Dependencies

```bash
# Install frontend dependencies
npm install
```

### 3.3 Install Backend Dependencies

```bash
# Install backend dependencies
cd backend
npm install
cd ..
```

---

## 🔐 Step 4: Configure Environment Variables

### 4.1 Backend Environment Variables

```bash
# Create backend .env file
nano backend/.env
```

Add the following content:

```env
# Gemini AI API Key
API_KEY=AIzaSyCHQ4NwOuz4RmY88aVUq5ViFcO2FIvohqo
GEMINI_API_KEY=AIzaSyCHQ4NwOuz4RmY88aVUq5ViFcO2FIvohqo

# SMTP Configuration (GoDaddy)
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@vaultchaintr.com
SMTP_PASSWORD=Aqwzsxedc123@

# Server Configuration
PORT=3001
NODE_ENV=production
```

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

### 4.2 Frontend Environment Variables (Optional)

```bash
# Frontend .env is NOT required (uses relative /api path)
# But you can create it if you want to be explicit:
nano .env
```

Add (optional):
```env
VITE_API_URL=/api
```

---

## 🏗️ Step 5: Build Frontend

```bash
# Make sure you're in project root
cd /var/www/vaultchain

# Build frontend for production
npm run build
```

This creates a `dist/` folder with optimized production files.

**Verify build:**
```bash
ls -la dist/
```

You should see:
- `index.html`
- `assets/` folder with JS and CSS files

---

## 🔄 Step 6: Configure PM2 (Process Manager)

### 6.1 Update PM2 Configuration

```bash
# Check ecosystem.config.cjs exists
cat ecosystem.config.cjs
```

The file should look like:
```javascript
module.exports = {
  apps: [{
    name: 'vaultchain-backend',
    script: './backend/server.js',
    cwd: '/var/www/vaultchain',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
```

**Note:** Make sure the `cwd` path matches your deployment directory (`/var/www/vaultchain`).

### 6.2 Create Logs Directory

```bash
mkdir -p logs
```

### 6.3 Start Backend with PM2

```bash
# Start backend
pm2 start ecosystem.config.cjs

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions shown (usually: sudo env PATH=... pm2 startup systemd -u ubuntu --hp /home/ubuntu)

# Check status
pm2 status

# View logs
pm2 logs vaultchain-backend
```

---

## 🌐 Step 7: Configure Nginx

### 7.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/vaultchaintr.com
```

Add the following configuration (HTTP only - Certbot will add SSL):

```nginx
# HTTP Server (Certbot will add HTTPS automatically)
server {
    listen 80;
    listen [::]:80;
    server_name vaultchaintr.com www.vaultchaintr.com;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Frontend Root Directory
    root /var/www/vaultchain/dist;
    index index.html;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
    
    # Increase client body size for file uploads (KYC documents)
    client_max_body_size 50M;
    
    # API Proxy to Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for long-running requests (file uploads)
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
        
        # Increase buffer sizes for large requests
        proxy_request_buffering off;
        proxy_buffering off;
    }
    
    # Static Assets Caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA Routing - serve index.html for all non-API routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

**Important:** Start with HTTP-only configuration. Certbot will automatically add HTTPS and redirect HTTP to HTTPS.

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

### 7.2 Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/vaultchaintr.com /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 Step 8: Setup SSL Certificate

### 8.1 Get SSL Certificate with Let's Encrypt

**Important:** Make sure your domain (`vaultchaintr.com`) is pointing to your EC2 IP address before running Certbot.

```bash
# Verify domain is pointing to your server
nslookup vaultchaintr.com

# Obtain SSL certificate (Certbot will automatically configure HTTPS)
sudo certbot --nginx -d vaultchaintr.com -d www.vaultchaintr.com

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service (type 'A' and press Enter)
# - Choose whether to redirect HTTP to HTTPS (recommended: option 2 - Redirect)
```

Certbot will automatically:
- Obtain the SSL certificate
- Update Nginx configuration to add HTTPS
- Set up HTTP to HTTPS redirect
- Configure auto-renewal

### 8.2 Verify SSL Configuration

```bash
# Test Nginx configuration
sudo nginx -t

# If successful, reload Nginx
sudo systemctl reload nginx

# Check certificate status
sudo certbot certificates
```

### 8.3 Test Auto-Renewal

```bash
# Test certificate renewal
sudo certbot renew --dry-run
```

---

## ✅ Step 9: Verify Deployment

### 9.1 Check Services Status

```bash
# Check PM2 (Backend)
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check if backend is responding
curl http://localhost:3001/api/data
```

### 9.2 Test from Browser

1. Open browser and visit: `https://vaultchaintr.com`
2. Check browser console (F12) for any errors
3. Test API endpoints:
   - Login functionality
   - API requests should work

### 9.3 Check Logs

```bash
# Backend logs
pm2 logs vaultchain-backend

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Step 10: Database Setup

### 10.1 Verify Database

```bash
# Check if database exists
ls -la backend/database.db

# If database doesn't exist, it will be created automatically on first backend start
```

### 10.2 Set Database Permissions

```bash
# Set proper permissions
chmod 644 backend/database.db
```

---

## 📝 Step 11: Post-Deployment Checklist

- [ ] Frontend loads at `https://vaultchaintr.com`
- [ ] Backend API responds at `https://vaultchaintr.com/api`
- [ ] SSL certificate is valid (green lock in browser)
- [ ] PM2 is running backend process
- [ ] Nginx is running and serving frontend
- [ ] Database file exists and has proper permissions
- [ ] All environment variables are set correctly
- [ ] Firewall allows ports 22, 80, 443
- [ ] Auto-renewal for SSL is configured

---

## 🔧 Troubleshooting

### Backend Not Starting

```bash
# Check PM2 logs
pm2 logs vaultchain-backend

# Restart backend
pm2 restart vaultchain-backend

# Check if port 3001 is in use
sudo netstat -tulpn | grep 3001
```

### Nginx Errors

```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### API Requests Failing

1. Check CORS configuration in `backend/app.js`
2. Verify backend is running: `pm2 status`
3. Check backend logs: `pm2 logs vaultchain-backend`
4. Test backend directly: `curl http://localhost:3001/api/data`

### Frontend Not Loading

1. Verify build exists: `ls -la dist/`
2. Check Nginx root directory in config
3. Check Nginx error logs
4. Verify file permissions: `sudo chown -R www-data:www-data /var/www/vaultchain/dist`

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check certificate expiration
sudo certbot certificates
```

---

## 🔄 Updating the Application

### Update Code

```bash
cd /var/www/vaultchain

# Pull latest changes
git pull

# OR upload new files via SCP/SFTP

# Rebuild frontend
npm run build

# Restart backend
pm2 restart vaultchain-backend

# Reload Nginx (if config changed)
sudo nginx -t && sudo systemctl reload nginx
```

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# View real-time monitoring
pm2 monit

# View process info
pm2 info vaultchain-backend

# View logs
pm2 logs vaultchain-backend --lines 100
```

### System Resources

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

---

## 🔐 Security Best Practices

1. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Regular backups:**
   ```bash
   # Backup database
   cp backend/database.db backend/database.db.backup
   ```

3. **Monitor logs regularly:**
   ```bash
   pm2 logs vaultchain-backend
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Keep SSL certificate updated:**
   - Auto-renewal is configured by Certbot
   - Check with: `sudo certbot certificates`

5. **Firewall configuration:**
   - Only allow necessary ports (22, 80, 443)
   - Block all other ports

---

## 📞 Quick Reference

### Important Commands

```bash
# Backend
pm2 start ecosystem.config.cjs    # Start backend
pm2 stop vaultchain-backend      # Stop backend
pm2 restart vaultchain-backend   # Restart backend
pm2 logs vaultchain-backend      # View logs
pm2 status                       # Check status

# Nginx
sudo nginx -t                    # Test configuration
sudo systemctl reload nginx      # Reload Nginx
sudo systemctl restart nginx     # Restart Nginx
sudo systemctl status nginx      # Check status

# SSL
sudo certbot renew               # Renew certificate
sudo certbot certificates        # List certificates

# Build
npm run build                    # Build frontend
```

### Important File Locations

- Frontend build: `/var/www/vaultchain/dist/`
- Backend code: `/var/www/vaultchain/backend/`
- Backend .env: `/var/www/vaultchain/backend/.env`
- Nginx config: `/etc/nginx/sites-available/vaultchaintr.com`
- PM2 config: `/var/www/vaultchain/ecosystem.config.cjs`
- Database: `/var/www/vaultchain/backend/database.db`
- Logs: `/var/www/vaultchain/logs/`

---

## ✅ Deployment Complete!

Your VaultChain application should now be live at:
- **Frontend**: `https://vaultchaintr.com`
- **Backend API**: `https://vaultchaintr.com/api`

If you encounter any issues, refer to the Troubleshooting section above.

---

**Need Help?** Check the logs and verify all services are running:
```bash
pm2 status
sudo systemctl status nginx
sudo certbot certificates
```

=======
# VaultChain Deployment Guide

Complete step-by-step guide to deploy VaultChain on AWS EC2.

## 📋 Prerequisites

- AWS EC2 instance (Ubuntu 20.04 or 22.04 recommended)
- Domain name: `vaultchaintr.com` pointing to your EC2 IP
- SSH access to your EC2 instance
- Basic knowledge of Linux commands

---

## 🚀 Step 1: Connect to Your EC2 Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

---

## 🔧 Step 2: Initial Server Setup

### 2.1 Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 2.2 Install Required Software

```bash
# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git

# Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx

# Install UFW (Firewall)
sudo apt install -y ufw
```

### 2.3 Configure Firewall

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 📦 Step 3: Clone and Setup Project

### 3.1 Clone Repository

```bash
# Create apps directory
sudo mkdir -p /var/www
cd /var/www

# Clone your repository
sudo git clone https://github.com/artuganxtn/vaultchain.git
# OR upload your project files via SCP/SFTP

# Set ownership
sudo chown -R $USER:$USER /var/www/vaultchain
cd vaultchain
```

### 3.2 Install Frontend Dependencies

```bash
# Install frontend dependencies
npm install
```

### 3.3 Install Backend Dependencies

```bash
# Install backend dependencies
cd backend
npm install
cd ..
```

---

## 🔐 Step 4: Configure Environment Variables

### 4.1 Backend Environment Variables

```bash
# Create backend .env file
nano backend/.env
```

Add the following content:

```env
# Gemini AI API Key
API_KEY=AIzaSyCHQ4NwOuz4RmY88aVUq5ViFcO2FIvohqo
GEMINI_API_KEY=AIzaSyCHQ4NwOuz4RmY88aVUq5ViFcO2FIvohqo

# SMTP Configuration (GoDaddy)
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@vaultchaintr.com
SMTP_PASSWORD=Aqwzsxedc123@

# Server Configuration
PORT=3001
NODE_ENV=production
```

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

### 4.2 Frontend Environment Variables (Optional)

```bash
# Frontend .env is NOT required (uses relative /api path)
# But you can create it if you want to be explicit:
nano .env
```

Add (optional):
```env
VITE_API_URL=/api
```

---

## 🏗️ Step 5: Build Frontend

```bash
# Make sure you're in project root
cd /var/www/vaultchain

# Build frontend for production
npm run build
```

This creates a `dist/` folder with optimized production files.

**Verify build:**
```bash
ls -la dist/
```

You should see:
- `index.html`
- `assets/` folder with JS and CSS files

---

## 🔄 Step 6: Configure PM2 (Process Manager)

### 6.1 Update PM2 Configuration

```bash
# Check ecosystem.config.js exists
cat ecosystem.config.js
```

The file should look like:
```javascript
module.exports = {
  apps: [{
    name: 'vaultchain-backend',
    script: './backend/server.js',
    cwd: '/var/www/vaultchain',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
```

**Note:** Make sure the `cwd` path matches your deployment directory (`/var/www/vaultchain`).

### 6.2 Create Logs Directory

```bash
mkdir -p logs
```

### 6.3 Start Backend with PM2

```bash
# Start backend
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions shown (usually: sudo env PATH=... pm2 startup systemd -u ubuntu --hp /home/ubuntu)

# Check status
pm2 status

# View logs
pm2 logs vaultchain-backend
```

---

## 🌐 Step 7: Configure Nginx

### 7.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/vaultchaintr.com
```

Add the following configuration:

```nginx
# HTTP to HTTPS Redirect
server {
    listen 80;
    listen [::]:80;
    server_name vaultchaintr.com www.vaultchaintr.com;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name vaultchaintr.com www.vaultchaintr.com;
    
    # SSL Configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/vaultchaintr.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/vaultchaintr.com/privkey.pem;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend Root Directory
    root /var/www/vaultchain/dist;
    index index.html;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
    
    # API Proxy to Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static Assets Caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA Routing - serve index.html for all non-API routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

### 7.2 Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/vaultchaintr.com /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 Step 8: Setup SSL Certificate

### 8.1 Get SSL Certificate with Let's Encrypt

```bash
# Obtain SSL certificate
sudo certbot --nginx -d vaultchaintr.com -d www.vaultchaintr.com

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

Certbot will automatically:
- Obtain the certificate
- Update Nginx configuration
- Set up auto-renewal

### 8.2 Test Auto-Renewal

```bash
# Test certificate renewal
sudo certbot renew --dry-run
```

---

## ✅ Step 9: Verify Deployment

### 9.1 Check Services Status

```bash
# Check PM2 (Backend)
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check if backend is responding
curl http://localhost:3001/api/data
```

### 9.2 Test from Browser

1. Open browser and visit: `https://vaultchaintr.com`
2. Check browser console (F12) for any errors
3. Test API endpoints:
   - Login functionality
   - API requests should work

### 9.3 Check Logs

```bash
# Backend logs
pm2 logs vaultchain-backend

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Step 10: Database Setup

### 10.1 Verify Database

```bash
# Check if database exists
ls -la backend/database.db

# If database doesn't exist, it will be created automatically on first backend start
```

### 10.2 Set Database Permissions

```bash
# Set proper permissions
chmod 644 backend/database.db
```

---

## 📝 Step 11: Post-Deployment Checklist

- [ ] Frontend loads at `https://vaultchaintr.com`
- [ ] Backend API responds at `https://vaultchaintr.com/api`
- [ ] SSL certificate is valid (green lock in browser)
- [ ] PM2 is running backend process
- [ ] Nginx is running and serving frontend
- [ ] Database file exists and has proper permissions
- [ ] All environment variables are set correctly
- [ ] Firewall allows ports 22, 80, 443
- [ ] Auto-renewal for SSL is configured

---

## 🔧 Troubleshooting

### Backend Not Starting

```bash
# Check PM2 logs
pm2 logs vaultchain-backend

# Restart backend
pm2 restart vaultchain-backend

# Check if port 3001 is in use
sudo netstat -tulpn | grep 3001
```

### Nginx Errors

```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### API Requests Failing

1. Check CORS configuration in `backend/app.js`
2. Verify backend is running: `pm2 status`
3. Check backend logs: `pm2 logs vaultchain-backend`
4. Test backend directly: `curl http://localhost:3001/api/data`

### Frontend Not Loading

1. Verify build exists: `ls -la dist/`
2. Check Nginx root directory in config
3. Check Nginx error logs
4. Verify file permissions: `sudo chown -R www-data:www-data /var/www/vaultchain/dist`

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check certificate expiration
sudo certbot certificates
```

---

## 🔄 Updating the Application

### Update Code

```bash
cd /var/www/vaultchain

# Pull latest changes
git pull

# OR upload new files via SCP/SFTP

# Rebuild frontend
npm run build

# Restart backend
pm2 restart vaultchain-backend

# Reload Nginx (if config changed)
sudo nginx -t && sudo systemctl reload nginx
```

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# View real-time monitoring
pm2 monit

# View process info
pm2 info vaultchain-backend

# View logs
pm2 logs vaultchain-backend --lines 100
```

### System Resources

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

---

## 🔐 Security Best Practices

1. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Regular backups:**
   ```bash
   # Backup database
   cp backend/database.db backend/database.db.backup
   ```

3. **Monitor logs regularly:**
   ```bash
   pm2 logs vaultchain-backend
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Keep SSL certificate updated:**
   - Auto-renewal is configured by Certbot
   - Check with: `sudo certbot certificates`

5. **Firewall configuration:**
   - Only allow necessary ports (22, 80, 443)
   - Block all other ports

---

## 📞 Quick Reference

### Important Commands

```bash
# Backend
pm2 start ecosystem.config.js    # Start backend
pm2 stop vaultchain-backend      # Stop backend
pm2 restart vaultchain-backend   # Restart backend
pm2 logs vaultchain-backend      # View logs
pm2 status                       # Check status

# Nginx
sudo nginx -t                    # Test configuration
sudo systemctl reload nginx      # Reload Nginx
sudo systemctl restart nginx     # Restart Nginx
sudo systemctl status nginx      # Check status

# SSL
sudo certbot renew               # Renew certificate
sudo certbot certificates        # List certificates

# Build
npm run build                    # Build frontend
```

### Important File Locations

- Frontend build: `/var/www/vaultchain/dist/`
- Backend code: `/var/www/vaultchain/backend/`
- Backend .env: `/var/www/vaultchain/backend/.env`
- Nginx config: `/etc/nginx/sites-available/vaultchaintr.com`
- PM2 config: `/var/www/vaultchain/ecosystem.config.js`
- Database: `/var/www/vaultchain/backend/database.db`
- Logs: `/var/www/vaultchain/logs/`

---

## ✅ Deployment Complete!

Your VaultChain application should now be live at:
- **Frontend**: `https://vaultchaintr.com`
- **Backend API**: `https://vaultchaintr.com/api`

If you encounter any issues, refer to the Troubleshooting section above.

---

**Need Help?** Check the logs and verify all services are running:
```bash
pm2 status
sudo systemctl status nginx
sudo certbot certificates
```

>>>>>>> 8cf7b9904c0e59190db7233e79357b9d9ab0b44b
