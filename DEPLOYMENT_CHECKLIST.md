# AWS EC2 Deployment Checklist

## Pre-Deployment

- [ ] AWS EC2 instance created (Ubuntu 22.04 LTS)
- [ ] Security group configured:
  - [ ] HTTP (Port 80) open to 0.0.0.0/0
  - [ ] HTTPS (Port 443) open to 0.0.0.0/0
  - [ ] SSH (Port 22) open to your IP
  - [ ] Port 3001 NOT publicly accessible
- [ ] Domain DNS configured:
  - [ ] `vaultchaintr.com` A record → EC2 Public IP
  - [ ] `www.vaultchaintr.com` A record → EC2 Public IP (or CNAME)
- [ ] SSH key pair downloaded (.pem file)
- [ ] Can connect to EC2 via SSH

## Configuration Files Review

### ✅ Already Configured (No Changes Needed):
- [x] `services/api.ts` - API_BASE_URL = `https://vaultchaintr.com/api`
- [x] `backend/server.js` - Listens on `0.0.0.0:3001`
- [x] `backend/app.js` - CORS includes production domain
- [x] `backend/ecosystem.config.js` - PM2 config ready

### ⚠️ Files to Create/Update on Server:

- [ ] `backend/.env` - Create with:
  - [ ] PORT=3001
  - [ ] NODE_ENV=production
  - [ ] HOST=0.0.0.0
  - [ ] SMTP configuration (email settings)
  - [ ] GEMINI_API_KEY (if using AI features)
- [ ] Nginx config - Copy and customize from `nginx-config-vaultchaintr.com-ssl.conf`

## Deployment Steps

### Server Setup
- [ ] Connected to EC2 via SSH
- [ ] System updated (`sudo apt update && sudo apt upgrade -y`)
- [ ] Node.js 18.x installed
- [ ] PM2 installed globally
- [ ] Nginx installed
- [ ] Certbot installed
- [ ] PM2 startup configured

### Application Upload
- [ ] Application code uploaded to EC2
- [ ] Located in `~/vaultchain` or chosen directory

### Backend Setup
- [ ] Backend dependencies installed (`npm install --production` in backend/)
- [ ] `backend/.env` file created with correct values
- [ ] `backend/logs/` directory created
- [ ] Backend started with PM2 (`pm2 start ecosystem.config.js`)
- [ ] PM2 configuration saved (`pm2 save`)
- [ ] Backend tested locally: `curl http://localhost:3001/api/data`

### Frontend Setup
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend built (`npm run build`)
- [ ] `dist/` folder created with production files

### Nginx Configuration
- [ ] Nginx config created at `/etc/nginx/sites-available/vaultchaintr.com`
- [ ] **IMPORTANT:** Update root path in config:
  - Use `/home/ubuntu/vaultchain/dist` if app is in home directory
  - OR use `/var/www/vaultchain/dist` if you move it there
- [ ] Site enabled (`sudo ln -s /etc/nginx/sites-available/vaultchaintr.com /etc/nginx/sites-enabled/`)
- [ ] Default site removed
- [ ] Nginx config tested (`sudo nginx -t`)
- [ ] Nginx restarted

### SSL Certificate
- [ ] DNS fully propagated (check with `nslookup vaultchaintr.com`)
- [ ] SSL certificate obtained (`sudo certbot --nginx`)
- [ ] HTTP to HTTPS redirect working
- [ ] SSL auto-renewal tested (`sudo certbot renew --dry-run`)

### Firewall
- [ ] UFW configured (`sudo ufw allow 'Nginx Full'`)
- [ ] UFW enabled

## Post-Deployment Testing

### Frontend
- [ ] Website loads: `https://vaultchaintr.com`
- [ ] No console errors in browser
- [ ] All pages/routes accessible
- [ ] Translations load correctly

### Backend API
- [ ] API accessible: `https://vaultchaintr.com/api/data`
- [ ] Login endpoint works: `https://vaultchaintr.com/api/auth/login`
- [ ] CORS headers present
- [ ] No errors in PM2 logs

### Integration
- [ ] Frontend can communicate with backend
- [ ] User registration works
- [ ] User login works
- [ ] Email functionality works (password reset, OTP)

## Monitoring & Maintenance

- [ ] PM2 monitoring set up
- [ ] Log rotation configured
- [ ] Backup strategy in place
- [ ] Uptime monitoring configured (optional)

## Quick Reference Commands

```bash
# Backend
pm2 status
pm2 logs vaultchain-backend
pm2 restart vaultchain-backend

# Nginx
sudo systemctl status nginx
sudo nginx -t
sudo systemctl restart nginx

# SSL
sudo certbot certificates
sudo certbot renew

# Logs
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

## Common Issues to Check

- [ ] DNS not propagated → Wait up to 48 hours
- [ ] Security group blocking traffic → Check AWS Console
- [ ] Backend not running → Check `pm2 status`
- [ ] Wrong file paths in Nginx → Verify `root` directive
- [ ] CORS errors → Check `backend/app.js` allowed origins
- [ ] SSL errors → Verify DNS, wait for propagation

---

**Notes:**
- Keep your `.env` file secure and never commit it to Git
- Regular backups of `database.db` recommended
- Monitor logs regularly for errors
- Keep system and dependencies updated

