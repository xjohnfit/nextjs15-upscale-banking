#!/bin/bash

# Make all scripts executable
chmod +x setup-nginx.sh
chmod +x setup-ssl.sh
chmod +x monitor.sh

echo "✅ All scripts are now executable!"
echo ""
echo "🚀 Quick start:"
echo "1. ./setup-nginx.sh     - Install and configure Nginx"
echo "2. Edit domain in config file"
echo "3. ./setup-ssl.sh yourdomain.com - Set up HTTPS"
echo "4. ./monitor.sh         - Check status anytime"
