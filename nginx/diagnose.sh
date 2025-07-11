#!/bin/bash

# DNS and Connectivity Diagnostic Script
# Use this to troubleshoot domain and server issues

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DOMAIN="upscalebanking.com"
SERVER_IP="46.202.89.158"
APP_PORT="30000"

echo -e "${BLUE}🔍 DNS and Connectivity Diagnostic for Upscale Banking${NC}"
echo "========================================================"

# 1. Check DNS resolution
echo -e "\n${YELLOW}1. DNS Resolution Check:${NC}"
echo "Testing domain: $DOMAIN"

if nslookup $DOMAIN >/dev/null 2>&1; then
    RESOLVED_IP=$(nslookup $DOMAIN | grep -A1 "Name:" | tail -n1 | awk '{print $2}')
    if [ "$RESOLVED_IP" = "$SERVER_IP" ]; then
        echo -e "${GREEN}✅ DNS correctly resolves to $SERVER_IP${NC}"
    else
        echo -e "${RED}❌ DNS resolves to $RESOLVED_IP instead of $SERVER_IP${NC}"
        echo -e "${YELLOW}⚠️  You need to update your A record to point to $SERVER_IP${NC}"
    fi
else
    echo -e "${RED}❌ Domain does not resolve${NC}"
    echo -e "${YELLOW}⚠️  You need to set up DNS A record: $DOMAIN → $SERVER_IP${NC}"
fi

# 2. Check WWW subdomain
echo -e "\n${YELLOW}2. WWW Subdomain Check:${NC}"
if nslookup www.$DOMAIN >/dev/null 2>&1; then
    WWW_IP=$(nslookup www.$DOMAIN | grep -A1 "Name:" | tail -n1 | awk '{print $2}')
    if [ "$WWW_IP" = "$SERVER_IP" ]; then
        echo -e "${GREEN}✅ www.$DOMAIN correctly resolves to $SERVER_IP${NC}"
    else
        echo -e "${YELLOW}⚠️  www.$DOMAIN resolves to $WWW_IP instead of $SERVER_IP${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  www.$DOMAIN does not resolve - consider adding this A record${NC}"
fi

# 3. Test server connectivity
echo -e "\n${YELLOW}3. Server Connectivity:${NC}"
if ping -c 1 $SERVER_IP >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Server $SERVER_IP is reachable${NC}"
else
    echo -e "${RED}❌ Server $SERVER_IP is not reachable${NC}"
fi

# 4. Test app on port 30000
echo -e "\n${YELLOW}4. App Accessibility Test:${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP:$APP_PORT 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ App responds on $SERVER_IP:$APP_PORT (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ App not responding on $SERVER_IP:$APP_PORT${NC}"
    echo -e "${YELLOW}   Check if Kubernetes pods are running${NC}"
fi

# 5. Test Nginx (if domain resolves)
echo -e "\n${YELLOW}5. Nginx Test:${NC}"
if nslookup $DOMAIN >/dev/null 2>&1; then
    NGINX_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN 2>/dev/null)
    if [ "$NGINX_CODE" = "200" ] || [ "$NGINX_CODE" = "404" ] || [ "$NGINX_CODE" = "302" ]; then
        echo -e "${GREEN}✅ Nginx is working via domain (HTTP $NGINX_CODE)${NC}"
    else
        echo -e "${RED}❌ Nginx not responding via domain${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping Nginx test - domain doesn't resolve${NC}"
fi

# 6. Test Nginx with Host header (bypass DNS)
echo -e "\n${YELLOW}6. Nginx Direct Test (bypass DNS):${NC}"
NGINX_DIRECT=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: $DOMAIN" http://$SERVER_IP 2>/dev/null)
if [ "$NGINX_DIRECT" = "200" ] || [ "$NGINX_DIRECT" = "404" ] || [ "$NGINX_DIRECT" = "302" ]; then
    echo -e "${GREEN}✅ Nginx is configured correctly (HTTP $NGINX_DIRECT)${NC}"
    echo -e "${GREEN}   This confirms Nginx is working - DNS is the issue${NC}"
else
    echo -e "${RED}❌ Nginx not responding even with direct IP${NC}"
    echo -e "${YELLOW}   Check if Nginx is running and configured properly${NC}"
fi

# 7. Recommendations
echo -e "\n${BLUE}📋 Recommendations:${NC}"

if ! nslookup $DOMAIN >/dev/null 2>&1; then
    echo -e "${YELLOW}🔧 DNS Setup Required:${NC}"
    echo "   1. Log into your domain registrar (GoDaddy, Namecheap, etc.)"
    echo "   2. Add A record: $DOMAIN → $SERVER_IP"
    echo "   3. Add A record: www.$DOMAIN → $SERVER_IP"
    echo "   4. Wait 5-60 minutes for DNS propagation"
    echo ""
    echo -e "${BLUE}🌐 Test DNS propagation globally:${NC}"
    echo "   Visit: https://www.whatsmydns.net/"
    echo "   Enter: $DOMAIN"
    echo "   Should show: $SERVER_IP"
fi

if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "404" ] && [ "$HTTP_CODE" != "302" ]; then
    echo -e "\n${YELLOW}🔧 App Issues:${NC}"
    echo "   Check Kubernetes pods: kubectl get pods"
    echo "   Check services: kubectl get services"
    echo "   Check logs: kubectl logs <pod-name>"
fi

if [ "$NGINX_DIRECT" != "200" ] && [ "$NGINX_DIRECT" != "404" ] && [ "$NGINX_DIRECT" != "302" ]; then
    echo -e "\n${YELLOW}🔧 Nginx Issues:${NC}"
    echo "   Check status: sudo systemctl status nginx"
    echo "   Test config: sudo nginx -t"
    echo "   Check logs: sudo tail -f /var/log/nginx/error.log"
fi

echo -e "\n${GREEN}✅ Run this script periodically to monitor your setup!${NC}"
