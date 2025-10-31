#!/bin/bash

# VaultChain Deployment Script
# Run this script on your EC2 instance to deploy/update the application

echo "🚀 Starting VaultChain Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please run as regular user (not root)${NC}"
   exit 1
fi

# Navigate to backend directory
cd ~/vaultchain-app/backend || exit

echo -e "${YELLOW}📦 Installing/Updating Backend Dependencies...${NC}"
npm install --production

echo -e "${YELLOW}🔄 Restarting Backend...${NC}"
pm2 restart vaultchain-backend || pm2 start ecosystem.config.js
pm2 save

# Navigate to frontend directory
cd ~/vaultchain-app/frontend || exit

echo -e "${YELLOW}📦 Installing/Updating Frontend Dependencies...${NC}"
npm install

echo -e "${YELLOW}🏗️  Building Frontend...${NC}"
npm run build

echo -e "${YELLOW}🔄 Restarting Nginx...${NC}"
sudo systemctl restart nginx

echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}Check your application at: https://vaultchaintr.com${NC}"

# Show status
echo -e "\n${YELLOW}📊 Application Status:${NC}"
pm2 status

