#!/bin/bash

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Navigate to application directory
cd /var/www/nhattin-api

print_status "Pulling latest code from repository..."
git pull origin main

if [ $? -ne 0 ]; then
    print_error "Failed to pull latest code"
    exit 1
fi

print_status "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_status "Building application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Failed to build application"
    exit 1
fi

print_status "Restarting PM2 process..."
pm2 restart nhattin-api

if [ $? -ne 0 ]; then
    print_error "Failed to restart PM2 process"
    exit 1
fi

print_status "Checking application status..."
pm2 status nhattin-api

print_status "✅ Deployment completed successfully!"
print_status "🌐 Application is running at: https://api.nhattinsoftware.com"
print_status "📚 API Documentation: https://api.nhattinsoftware.com/docs"

# Show recent logs
print_status "Recent application logs:"
pm2 logs nhattin-api --lines 10
