#!/bin/bash

# Deployment script for CAC Bank proxy server

echo "🚀 Deploying CAC Bank proxy server to Digital Ocean..."

# Server configuration
SERVER_IP="157.230.110.104"
SERVER_USER="root"
SERVER_PATH="/var/www/cacint-proxy"

# Check if server is reachable
echo "🔍 Checking server connectivity..."
if ! ping -c 1 $SERVER_IP > /dev/null 2>&1; then
    echo "❌ Server $SERVER_IP is not reachable"
    exit 1
fi

echo "✅ Server is reachable"

# Copy files to server
echo "📁 Copying files to server..."
scp server.js $SERVER_USER@$SERVER_IP:$SERVER_PATH/
scp package.json $SERVER_USER@$SERVER_IP:$SERVER_PATH/
scp ecosystem.config.js $SERVER_USER@$SERVER_IP:$SERVER_PATH/

# Install dependencies and restart service
echo "🔄 Installing dependencies and restarting service..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /var/www/cacint-proxy
npm install --production
pm2 restart cacint-proxy
pm2 save
EOF

echo "✅ Deployment complete!"
echo ""
echo "🌐 Proxy server is now running with multi-site CORS support"
echo "📋 Allowed origins:"
echo "   - https://gab-fashion-house.vercel.app"
echo "   - https://urban-jungle.vercel.app"
echo "   - http://localhost:5173"
echo "   - http://localhost:3000"
echo ""
echo "🔍 Check status: ssh $SERVER_USER@$SERVER_IP 'pm2 status'"
echo "📊 View logs: ssh $SERVER_USER@$SERVER_IP 'pm2 logs cacint-proxy'"

