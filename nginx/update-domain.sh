#!/bin/bash

# Quick Domain Update Script for Nginx Configuration
# This will update the Nginx config with your actual domain

set -e

CURRENT_DOMAIN="upscalebanking.com"
NEW_DOMAIN="upscalebanking.codewithxjohn.com"
NEW_WWW_DOMAIN="www.upscalebanking.codewithxjohn.com"

echo "🔧 Updating Nginx configuration for domain: $NEW_DOMAIN"

# Check if the configuration file exists
if [ ! -f /etc/nginx/sites-available/upscale-banking ]; then
    echo "❌ Nginx configuration file not found!"
    echo "Please make sure you've run the setup script first:"
    echo "  sudo ./setup-nginx.sh"
    exit 1
fi

# Create a backup
echo "💾 Creating backup of current configuration..."
sudo cp /etc/nginx/sites-available/upscale-banking /etc/nginx/sites-available/upscale-banking.backup.$(date +%Y%m%d_%H%M%S)

# Update the domain in the configuration
echo "📝 Updating domain in Nginx configuration..."
sudo sed -i "s/$CURRENT_DOMAIN/$NEW_DOMAIN/g" /etc/nginx/sites-available/upscale-banking
sudo sed -i "s/www\.$CURRENT_DOMAIN/$NEW_WWW_DOMAIN/g" /etc/nginx/sites-available/upscale-banking

# Also update SSL certificate paths if they exist
sudo sed -i "s/live\/$CURRENT_DOMAIN\//live\/$NEW_DOMAIN\//g" /etc/nginx/sites-available/upscale-banking

# Test the configuration
echo "🧪 Testing Nginx configuration..."
if sudo nginx -t; then
    echo "✅ Configuration test passed!"
    
    # Reload Nginx
    echo "🔄 Reloading Nginx..."
    sudo systemctl reload nginx
    
    echo "✅ Domain update complete!"
    echo ""
    echo "🌐 Your app should now be accessible at:"
    echo "   http://$NEW_DOMAIN"
    echo "   http://$NEW_WWW_DOMAIN"
    echo ""
    echo "🧪 Test it:"
    echo "   curl -I http://$NEW_DOMAIN"
    echo ""
    echo "🔒 When ready for SSL, run:"
    echo "   ./setup-ssl.sh $NEW_DOMAIN"
    
else
    echo "❌ Configuration test failed!"
    echo "Restoring backup..."
    sudo cp /etc/nginx/sites-available/upscale-banking.backup.$(date +%Y%m%d)* /etc/nginx/sites-available/upscale-banking
    exit 1
fi
