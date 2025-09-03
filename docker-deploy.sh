#!/bin/bash

# Docker deployment script for Lark Embed App
set -e

echo "🐳 Deploying Lark Embed App with Docker..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your configuration."
    exit 1
fi

# Build and start production containers
echo "🏗️  Building and starting production containers..."
docker-compose up -d --build

# Wait for health check
echo "⏳ Waiting for application to be ready..."
sleep 10

# Check health
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Application is healthy and running!"
    echo "🌐 Access your app at: http://localhost:3001"
else
    echo "⚠️  Application might still be starting up..."
    echo "🔍 Check logs with: docker-compose logs -f"
fi

echo "🎉 Deployment complete!"
