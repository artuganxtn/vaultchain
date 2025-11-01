#!/bin/bash

# Backend Setup Script
# Run this AFTER uploading backend code to ~/vaultchain-app/backend/

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BACKEND_DIR="$HOME/vaultchain-app/backend"

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Backend directory not found at $BACKEND_DIR${NC}"
    echo "Please upload your backend code first!"
    exit 1
fi

cd "$BACKEND_DIR"

echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
npm install --production

echo ""
echo -e "${YELLOW}📝 Creating .env file...${NC}"
if [ ! -f .env ]; then
    cat > .env << 'EOF'
# Server Configuration
PORT=3001
NODE_ENV=production
HOST=0.0.0.0

# Frontend URL (for CORS and email links)
FRONTEND_URL=https://vaultchaintr.com

# Database Path
DATABASE_PATH=./database.db

# SMTP Email Configuration (Optional - add your credentials)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@vaultchaintr.com
# SMTP_PASSWORD=your-app-password

# Google AI API Key (Optional - if using AI features)
# API_KEY=your-google-ai-api-key
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env file with: nano .env${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

echo ""
echo -e "${YELLOW}📁 Creating logs directory...${NC}"
mkdir -p logs

echo ""
echo -e "${YELLOW}🚀 Starting backend with PM2...${NC}"
pm2 start ecosystem.config.js || pm2 restart vaultchain-backend
pm2 save

echo ""
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
sleep 3

echo ""
echo -e "${YELLOW}🔍 Testing backend...${NC}"
if curl -s http://localhost:3001/api/data > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is responding!${NC}"
else
    echo -e "${RED}⚠️  Backend not responding. Check logs: pm2 logs vaultchain-backend${NC}"
fi

echo ""
echo -e "${GREEN}✅ Backend setup complete!${NC}"
echo ""
echo "Check status: pm2 status"
echo "View logs: pm2 logs vaultchain-backend"

