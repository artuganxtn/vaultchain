#!/bin/bash

# VaultChain AWS EC2 Deployment Setup Script
# Run this script on your EC2 instance after initial setup

set -e

echo "=========================================="
echo "VaultChain Deployment Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root. Use a regular user with sudo privileges.${NC}"
   exit 1
fi

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
sudo apt update
sudo apt upgrade -y

# Install Node.js 20.x
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Installing Node.js 20.x...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo -e "${GREEN}Node.js already installed: $(node --version)${NC}"
fi

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Installing Nginx...${NC}"
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
else
    echo -e "${GREEN}Nginx already installed${NC}"
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    sudo npm install -g pm2
else
    echo -e "${GREEN}PM2 already installed${NC}"
fi

# Install Git
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}Installing Git...${NC}"
    sudo apt install -y git
else
    echo -e "${GREEN}Git already installed${NC}"
fi

# Install Certbot
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installing Certbot...${NC}"
    sudo apt install -y certbot python3-certbot-nginx
else
    echo -e "${GREEN}Certbot already installed${NC}"
fi

# Setup firewall
echo -e "${YELLOW}Configuring firewall (UFW)...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable

# Create application directory
echo -e "${YELLOW}Creating application directory...${NC}"
mkdir -p ~/apps
cd ~/apps

# Check if vaultchain directory exists
if [ ! -d "vaultchain" ]; then
    echo -e "${YELLOW}Please clone or upload your vaultchain application to ~/apps/vaultchain${NC}"
    echo -e "${YELLOW}Then run this script again to continue setup${NC}"
    exit 0
fi

cd vaultchain

# Install dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install

echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
npm install
cd ..

# Create logs directory
mkdir -p logs

# Create backup directory
mkdir -p ~/backups

# Setup PM2 startup
echo -e "${YELLOW}Setting up PM2 startup...${NC}"
pm2 startup systemd | grep "sudo" | bash || true

echo ""
echo -e "${GREEN}=========================================="
echo "Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Configure environment variables:"
echo "   - Edit ~/apps/vaultchain/.env (frontend)"
echo "   - Edit ~/apps/vaultchain/backend/.env (backend)"
echo ""
echo "2. Build frontend:"
echo "   cd ~/apps/vaultchain && npm run build"
echo ""
echo "3. Configure Nginx (see AWS-EC2-DEPLOYMENT.md)"
echo ""
echo "4. Setup SSL certificate:"
echo "   sudo certbot --nginx -d vaultchaintr.com -d www.vaultchaintr.com"
echo ""
echo "5. Start backend:"
echo "   cd ~/apps/vaultchain && pm2 start ecosystem.config.js && pm2 save"
echo ""

