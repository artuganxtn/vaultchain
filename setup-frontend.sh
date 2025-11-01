#!/bin/bash

# Frontend Setup Script
# Run this AFTER uploading frontend code to ~/vaultchain-app/frontend/

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

FRONTEND_DIR="$HOME/vaultchain-app/frontend"
WEB_ROOT="/var/www/vaultchain/dist"

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Frontend directory not found at $FRONTEND_DIR${NC}"
    echo "Please upload your frontend code first!"
    exit 1
fi

cd "$FRONTEND_DIR"

echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
npm install

echo ""
echo -e "${YELLOW}🏗️  Building frontend (this copies translations automatically)...${NC}"
npm run build

echo ""
echo -e "${YELLOW}🔍 Verifying translations are in build...${NC}"
if [ -d "dist/translations" ]; then
    echo -e "${GREEN}✅ Translations found in dist/translations/${NC}"
    ls -la dist/translations/
else
    echo -e "${RED}⚠️  WARNING: Translations not found in dist/translations/${NC}"
    echo "Translations should be copied automatically by vite.config.ts plugin"
fi

echo ""
echo -e "${YELLOW}📋 Copying built files to web root...${NC}"
sudo rm -rf "$WEB_ROOT"/*
sudo cp -r dist/* "$WEB_ROOT"/
sudo chown -R www-data:www-data "$WEB_ROOT"
sudo chmod -R 755 "$WEB_ROOT"

echo ""
echo -e "${YELLOW}🔍 Verifying translations in web root...${NC}"
if [ -d "$WEB_ROOT/translations" ]; then
    echo -e "${GREEN}✅ Translations in web root:${NC}"
    ls -la "$WEB_ROOT/translations/"
    
    # Test JSON validity
    for file in "$WEB_ROOT/translations"/*.json; do
        if [ -f "$file" ]; then
            if python3 -m json.tool "$file" > /dev/null 2>&1; then
                echo -e "${GREEN}   ✅ $(basename $file) is valid JSON${NC}"
            else
                echo -e "${RED}   ❌ $(basename $file) is NOT valid JSON${NC}"
            fi
        fi
    done
else
    echo -e "${RED}❌ Translations NOT in web root!${NC}"
    echo "Manually copying translations..."
    sudo mkdir -p "$WEB_ROOT/translations"
    if [ -d "dist/translations" ]; then
        sudo cp dist/translations/*.json "$WEB_ROOT/translations/" 2>/dev/null || true
    fi
    if [ -d "translations" ]; then
        sudo cp translations/*.json "$WEB_ROOT/translations/" 2>/dev/null || true
    fi
fi

echo ""
echo -e "${YELLOW}🌐 Setting up nginx...${NC}"

# Check if nginx config exists
if [ ! -f "/etc/nginx/sites-available/vaultchaintr.com" ]; then
    echo -e "${YELLOW}Creating nginx configuration...${NC}"
    sudo tee /etc/nginx/sites-available/vaultchaintr.com > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    listen [::]:80;
    server_name vaultchaintr.com www.vaultchaintr.com;
    
    root /var/www/vaultchain/dist;
    index index.html;
    
    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # Translations JSON files - FIX FOR TRANSLATION ERROR
    location /translations/ {
        root /var/www/vaultchain/dist;
        default_type application/json;
        add_header Content-Type application/json;
        expires 1h;
        add_header Cache-Control "public, max-age=3600";
        try_files $uri =404;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/vaultchain/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF

    sudo ln -sf /etc/nginx/sites-available/vaultchaintr.com /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
else
    echo -e "${GREEN}✅ Nginx configuration exists${NC}"
fi

echo ""
echo -e "${YELLOW}🧪 Testing nginx configuration...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    sudo systemctl restart nginx
    echo -e "${GREEN}✅ Nginx restarted${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Frontend setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Setup SSL: sudo certbot --nginx -d vaultchaintr.com -d www.vaultchaintr.com"
echo "2. Test website: curl https://vaultchaintr.com/translations/en.json"
echo "3. Visit in browser: https://vaultchaintr.com"

