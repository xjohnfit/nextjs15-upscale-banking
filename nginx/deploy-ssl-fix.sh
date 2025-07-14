#!/bin/bash

echo "=== Deploying Fixed SSL Nginx Configuration ==="

# Copy the fixed configuration
sudo cp upscalebanking-ssl-fixed.conf /etc/nginx/sites-available/upscalebanking.conf

# Test nginx configuration
echo "Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuration test passed!"
    
    # Reload nginx
    echo "Reloading nginx..."
    sudo systemctl reload nginx
    
    echo "✅ Nginx reloaded successfully!"
    echo ""
    echo "🔧 Fixed Issues:"
    echo "   - Corrected proxy target to 46.202.89.158:30000"
    echo "   - Fixed HTTP to HTTPS redirect"
    echo "   - Added upstream configuration"
    echo "   - Enhanced headers for Next.js"
    echo "   - Added proper caching for static assets"
    echo ""
    echo "🌐 Your app should now be accessible at:"
    echo "   - https://upscalebanking.codewithxjohn.com"
    echo "   - https://www.upscalebanking.codewithxjohn.com"
    echo "   - HTTP requests will automatically redirect to HTTPS"
    
else
    echo "❌ Configuration test failed!"
    echo "Please check the nginx error log:"
    echo "sudo tail -n 20 /var/log/nginx/error.log"
fi
