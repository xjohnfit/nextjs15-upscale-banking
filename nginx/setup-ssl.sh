#!/bin/bash

# SSL Setup Script for Upscale Banking App
# Run this script AFTER your domain is pointing to your server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔒 Setting up SSL for Upscale Banking App...${NC}"

# Check if domain is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Please provide your domain name${NC}"
    echo "Usage: ./setup-ssl.sh yourdomain.com"
    exit 1
fi

DOMAIN=$1
WWW_DOMAIN="www.$1"

echo -e "${YELLOW}📋 Domain: $DOMAIN${NC}"
echo -e "${YELLOW}📋 WWW Domain: $WWW_DOMAIN${NC}"

# Update the Nginx configuration with the actual domain
echo -e "${GREEN}📝 Updating Nginx configuration with your domain...${NC}"
sudo sed -i "s/yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/upscale-banking

# Test the configuration
echo -e "${GREEN}🧪 Testing Nginx configuration...${NC}"
sudo nginx -t

# Reload Nginx
echo -e "${GREEN}🔄 Reloading Nginx...${NC}"
sudo systemctl reload nginx

# Obtain SSL certificate
echo -e "${GREEN}🔒 Obtaining SSL certificate from Let's Encrypt...${NC}"
sudo certbot --nginx -d $DOMAIN -d $WWW_DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Update Nginx config to enable SSL (uncomment SSL lines)
echo -e "${GREEN}📝 Enabling SSL in Nginx configuration...${NC}"
sudo sed -i 's/# listen 443 ssl http2;/listen 443 ssl http2;/' /etc/nginx/sites-available/upscale-banking
sudo sed -i 's/# ssl_certificate/ssl_certificate/' /etc/nginx/sites-available/upscale-banking
sudo sed -i 's/# include \/etc\/letsencrypt/include \/etc\/letsencrypt/' /etc/nginx/sites-available/upscale-banking

# Uncomment HTTP to HTTPS redirect
sudo sed -i '/# HTTP redirect to HTTPS/,/# }/{s/^# //}' /etc/nginx/sites-available/upscale-banking

# Test and reload again
echo -e "${GREEN}🧪 Testing updated Nginx configuration...${NC}"
sudo nginx -t

echo -e "${GREEN}🔄 Reloading Nginx with SSL configuration...${NC}"
sudo systemctl reload nginx

# Set up automatic certificate renewal
echo -e "${GREEN}⏰ Setting up automatic certificate renewal...${NC}"
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo -e "${GREEN}✅ SSL setup complete!${NC}"
echo ""
echo -e "${GREEN}🎉 Your app is now accessible at:${NC}"
echo -e "${YELLOW}   https://$DOMAIN${NC}"
echo -e "${YELLOW}   https://$WWW_DOMAIN${NC}"
echo ""
echo -e "${GREEN}📋 SSL Certificate Info:${NC}"
sudo certbot certificates
echo ""
echo -e "${GREEN}🔄 Certificate will auto-renew. Test renewal with:${NC}"
echo -e "${YELLOW}   sudo certbot renew --dry-run${NC}"
