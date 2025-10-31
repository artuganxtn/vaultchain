# Quick Start Guide - AWS EC2 Deployment

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] AWS EC2 instance running Ubuntu 22.04
- [ ] EC2 security group allows: HTTP (80), HTTPS (443), SSH (22), Custom TCP (3001)
- [ ] Domain `vaultchaintr.com` DNS pointing to EC2 public IP
- [ ] SSH access to EC2 instance

---

## Fast Track Deployment (15 minutes)

### 1. Connect to EC2
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2. Run Initial Setup
```bash
# Update system and install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl git nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Setup PM2 auto-start
pm2 startup systemd
# Run the command it outputs
```

### 3. Upload Your Code

**Option A: Using Git (Recommended)**
```bash
cd ~
git clone your-repo-url vaultchain-app
cd vaultchain-app
```

**Option B: Using SCP from your local machine**
```bash
# From your local machine
scp -i your-key.pem -r /path/to/vaultchain ubuntu@your-ec2-ip:~/vaultchain-app
```

### 4. Setup Backend
```bash
cd ~/vaultchain-app/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
```

**Paste this in .env:**
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://vaultchaintr.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@vaultchaintr.com
SMTP_PASSWORD=your-app-password
```

**Save:** Ctrl+X, then Y, then Enter

```bash
# Start with PM2
pm2 start ecosystem.config.js
pm2 save
```

### 5. Setup Frontend
```bash
cd ~/vaultchain-app/frontend

# Install and build
npm install
npm run build
```

### 6. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/vaultchaintr.com
```

**Paste this configuration:**
```nginx
server {
    listen 80;
    server_name vaultchaintr.com www.vaultchaintr.com;

    location / {
        root /home/ubuntu/vaultchain-app/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

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
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/vaultchaintr.com /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Setup SSL (HTTPS)
```bash
sudo certbot --nginx -d vaultchaintr.com -d www.vaultchaintr.com
# Follow prompts - enter email, agree to terms, redirect HTTP to HTTPS
```

### 8. Configure Firewall
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow 'OpenSSH'
sudo ufw enable
```

### 9. Test!
Visit: `https://vaultchaintr.com`

---

## Updating Your Application

```bash
# Make deploy.sh executable
chmod +x ~/vaultchain-app/deploy.sh

# Run update
cd ~/vaultchain-app
./deploy.sh
```

Or manually:
```bash
# Backend update
cd ~/vaultchain-app/backend
git pull  # or upload new files
npm install --production
pm2 restart vaultchain-backend

# Frontend update
cd ~/vaultchain-app/frontend
git pull  # or upload new files
npm install
npm run build
sudo systemctl restart nginx
```

---

## Common Issues

### Can't access website
- Check DNS: `nslookup vaultchaintr.com`
- Check security group: Ports 80, 443 open
- Check Nginx: `sudo systemctl status nginx`

### API not working
- Check backend: `pm2 status`
- Check logs: `pm2 logs vaultchain-backend`
- Test: `curl http://localhost:3001/api/data`

### SSL not working
- Wait for DNS propagation (up to 48 hours)
- Check domain points to EC2: `dig vaultchaintr.com`

---

## Useful Commands

```bash
# Check backend
pm2 status
pm2 logs vaultchain-backend

# Restart services
pm2 restart vaultchain-backend
sudo systemctl restart nginx

# View logs
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

---

For detailed information, see `DEPLOYMENT_GUIDE.md`

