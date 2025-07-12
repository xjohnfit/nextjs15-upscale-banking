#!/bin/bash

# Monitoring Script for Upscale Banking App
# Use this to check the status of your services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 Upscale Banking App - Service Status Monitor${NC}"
echo "=================================================="

# Check Nginx status
echo -e "\n${YELLOW}🔧 Nginx Status:${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Nginx is not running${NC}"
fi

# Check Nginx configuration
echo -e "\n${YELLOW}📝 Nginx Configuration Test:${NC}"
if sudo nginx -t 2>/dev/null; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    echo "Run 'sudo nginx -t' to see details"
fi

# Check Kubernetes pods
echo -e "\n${YELLOW}☸️ Kubernetes Pods Status:${NC}"
if command -v kubectl &> /dev/null; then
    kubectl get pods -o wide
else
    echo -e "${YELLOW}⚠️ kubectl not available - check pods manually${NC}"
fi

# Check if app is accessible on port 30000
echo -e "\n${YELLOW}🌐 App Accessibility Check:${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:30000 | grep -q "200\|404\|302"; then
    echo -e "${GREEN}✅ App is responding on port 30000${NC}"
else
    echo -e "${RED}❌ App is not responding on port 30000${NC}"
fi

# Check SSL certificate status (if exists)
echo -e "\n${YELLOW}🔒 SSL Certificate Status:${NC}"
if [ -f /etc/letsencrypt/live/*/fullchain.pem ]; then
    echo -e "${GREEN}✅ SSL certificate found${NC}"
    sudo certbot certificates 2>/dev/null | grep -E "(Certificate Name|Domains|Expiry Date)" || echo "Run 'sudo certbot certificates' for details"
else
    echo -e "${YELLOW}⚠️ No SSL certificate found${NC}"
fi

# Check recent Nginx access logs
echo -e "\n${YELLOW}📝 Recent Nginx Access Logs (last 5 entries):${NC}"
if [ -f /var/log/nginx/upscale-banking.access.log ]; then
    sudo tail -5 /var/log/nginx/upscale-banking.access.log
else
    echo -e "${YELLOW}⚠️ No access logs found yet${NC}"
fi

# Check for Nginx errors
echo -e "\n${YELLOW}🚨 Recent Nginx Error Logs (last 5 entries):${NC}"
if [ -f /var/log/nginx/upscale-banking.error.log ]; then
    if [ -s /var/log/nginx/upscale-banking.error.log ]; then
        sudo tail -5 /var/log/nginx/upscale-banking.error.log
    else
        echo -e "${GREEN}✅ No recent errors${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ No error logs found yet${NC}"
fi

# Check disk space
echo -e "\n${YELLOW}💾 Disk Space:${NC}"
df -h / | tail -1 | awk '{print "Used: " $3 "/" $2 " (" $5 ")"}'

# Check memory usage
echo -e "\n${YELLOW}🧠 Memory Usage:${NC}"
free -h | grep Mem | awk '{print "Used: " $3 "/" $2}'

# Network connectivity test
echo -e "\n${YELLOW}🌐 External Connectivity Test:${NC}"
if ping -c 1 8.8.8.8 &> /dev/null; then
    echo -e "${GREEN}✅ Internet connection is working${NC}"
else
    echo -e "${RED}❌ No internet connection${NC}"
fi

echo ""
echo -e "${BLUE}📋 Quick Commands:${NC}"
echo "  View live access logs: sudo tail -f /var/log/nginx/upscale-banking.access.log"
echo "  View live error logs:  sudo tail -f /var/log/nginx/upscale-banking.error.log"
echo "  Restart Nginx:         sudo systemctl restart nginx"
echo "  Test Nginx config:     sudo nginx -t"
echo "  Check SSL renewal:     sudo certbot renew --dry-run"
