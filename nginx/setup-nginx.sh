#!/bin/bash

# Nginx Setup Script for Upscale Banking App
# Run this script on your VPS to set up Nginx

set -e

echo "🚀 Setting up Nginx for Upscale Banking App..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Nginx
echo "🔧 Installing Nginx..."
sudo apt install nginx -y

# Install Certbot for SSL (Let's Encrypt)
echo "🔒 Installing Certbot for SSL certificates..."
sudo apt install certbot python3-certbot-nginx -y

# Create backup of default Nginx config
echo "💾 Creating backup of default Nginx configuration..."
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Copy our configuration
echo "📝 Setting up Nginx configuration..."
sudo cp upscale-banking.conf /etc/nginx/sites-available/upscale-banking

# Remove default site and enable our site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/upscale-banking /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Start and enable Nginx
echo "🚀 Starting Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Check Nginx status
sudo systemctl status nginx

echo "✅ Nginx setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your domain DNS A record to point to this server's IP (46.202.89.158)"
echo "2. Replace 'yourdomain.com' in /etc/nginx/sites-available/upscale-banking with your actual domain"
echo "3. Reload Nginx: sudo systemctl reload nginx"
echo "4. Set up SSL certificate: sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo ""
echo "🌐 Your app should be accessible at: http://yourdomain.com"
echo "📊 Check Nginx status: sudo systemctl status nginx"
echo "📝 View Nginx logs: sudo tail -f /var/log/nginx/upscale-banking.access.log"
