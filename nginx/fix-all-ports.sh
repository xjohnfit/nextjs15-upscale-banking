#!/bin/bash

# Complete Port Configuration Fix for Upscale Banking App

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Fixing Kubernetes Port Configuration${NC}"
echo "======================================="

# Check what port the app actually runs on
echo -e "\n${YELLOW}1. Checking your Next.js configuration...${NC}"

# Check package.json for the start script
if [ -f "package.json" ]; then
    START_SCRIPT=$(grep -A 1 '"start"' package.json | grep -o 'PORT=[0-9]*' || echo "")
    if [ -n "$START_SCRIPT" ]; then
        APP_PORT=$(echo $START_SCRIPT | cut -d'=' -f2)
        echo "Found PORT=$APP_PORT in package.json start script"
    else
        # Check for next start with port
        NEXT_PORT=$(grep -A 1 '"start"' package.json | grep -o '\-p [0-9]*' | cut -d' ' -f2 || echo "")
        if [ -n "$NEXT_PORT" ]; then
            APP_PORT=$NEXT_PORT
            echo "Found port $APP_PORT in next start command"
        else
            APP_PORT=3000
            echo "No specific port found, using Next.js default: 3000"
        fi
    fi
else
    APP_PORT=3000
    echo "No package.json found, using Next.js default: 3000"
fi

echo -e "${GREEN}✅ App should run on port: $APP_PORT${NC}"

# Backup current files
echo -e "\n${YELLOW}2. Creating backups...${NC}"
if [ -f "kubernetes/deployment.yml" ]; then
    cp kubernetes/deployment.yml kubernetes/deployment.yml.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ deployment.yml backed up"
fi

if [ -f "kubernetes/service.yml" ]; then
    cp kubernetes/service.yml kubernetes/service.yml.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ service.yml backed up"
fi

# Fix deployment.yml
echo -e "\n${YELLOW}3. Fixing deployment.yml...${NC}"
if [ -f "kubernetes/deployment.yml" ]; then
    # Update containerPort
    sed -i "s/containerPort: [0-9]*/containerPort: $APP_PORT/" kubernetes/deployment.yml
    echo "✅ Updated containerPort to $APP_PORT"
else
    echo -e "${RED}❌ kubernetes/deployment.yml not found${NC}"
    exit 1
fi

# Fix service.yml
echo -e "\n${YELLOW}4. Fixing service.yml...${NC}"
if [ -f "kubernetes/service.yml" ]; then
    # Update port and targetPort
    sed -i "s/port: [0-9]*/port: $APP_PORT/" kubernetes/service.yml
    sed -i "s/targetPort: [0-9]*/targetPort: $APP_PORT/" kubernetes/service.yml
    echo "✅ Updated service ports to $APP_PORT"
else
    echo -e "${RED}❌ kubernetes/service.yml not found${NC}"
    exit 1
fi

# Show the updated configurations
echo -e "\n${YELLOW}5. Updated configurations:${NC}"
echo -e "${BLUE}--- deployment.yml ---${NC}"
grep -A 2 -B 2 "containerPort:" kubernetes/deployment.yml

echo -e "\n${BLUE}--- service.yml ---${NC}"
grep -A 4 -B 1 "ports:" kubernetes/service.yml

# Apply the changes
echo -e "\n${YELLOW}6. Applying changes to Kubernetes...${NC}"
echo "Applying deployment..."
kubectl apply -f kubernetes/deployment.yml

echo "Applying service..."
kubectl apply -f kubernetes/service.yml

# Wait for rollout
echo -e "\n${YELLOW}7. Waiting for deployment to rollout...${NC}"
kubectl rollout status deployment/upscale-banking-deployment --timeout=120s

# Wait a bit more for service to be ready
echo "Waiting for service to be ready..."
sleep 10

# Test the connection
echo -e "\n${YELLOW}8. Testing connectivity...${NC}"

# First test if pods are running
echo "Checking pods..."
kubectl get pods | grep upscale

# Test internal pod connectivity
POD_NAME=$(kubectl get pods 2>/dev/null | grep upscale | grep Running | head -1 | awk '{print $1}')
if [ -n "$POD_NAME" ]; then
    echo "Testing app inside pod $POD_NAME on port $APP_PORT..."
    POD_RESPONSE=$(kubectl exec $POD_NAME -- curl -s -o /dev/null -w "%{http_code}" http://localhost:$APP_PORT 2>/dev/null || echo "000")
    if [ "$POD_RESPONSE" = "200" ] || [ "$POD_RESPONSE" = "404" ] || [ "$POD_RESPONSE" = "302" ]; then
        echo -e "${GREEN}✅ App responds inside pod (HTTP $POD_RESPONSE)${NC}"
    else
        echo -e "${RED}❌ App not responding inside pod (HTTP $POD_RESPONSE)${NC}"
        echo "Checking pod logs..."
        kubectl logs $POD_NAME --tail=10
    fi
fi

# Test NodePort
echo "Testing NodePort 30000..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:30000 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ NodePort 30000 accessible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ NodePort 30000 not accessible (HTTP $HTTP_CODE)${NC}"
fi

# Test external IP
echo "Testing external access..."
EXT_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://46.202.89.158:30000 2>/dev/null || echo "000")
if [ "$EXT_CODE" = "200" ] || [ "$EXT_CODE" = "404" ] || [ "$EXT_CODE" = "302" ]; then
    echo -e "${GREEN}✅ External access works (HTTP $EXT_CODE)${NC}"
else
    echo -e "${RED}❌ External access failed (HTTP $EXT_CODE)${NC}"
fi

# Final status
echo -e "\n${BLUE}📊 Final Status:${NC}"
echo "App Port: $APP_PORT"
echo "Service Status:"
kubectl get services | grep upscale || echo "No upscale service found"
echo ""
echo "Pod Status:"
kubectl get pods | grep upscale || echo "No upscale pods found"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "\n${GREEN}🎉 SUCCESS! Your app should now be accessible at:${NC}"
    echo -e "${GREEN}   http://46.202.89.158:30000${NC}"
    echo -e "${GREEN}   http://upscalebanking.codewithxjohn.com${NC}"
else
    echo -e "\n${RED}❌ Still having issues. Check the logs above.${NC}"
    echo -e "${YELLOW}💡 Try these commands:${NC}"
    echo "   kubectl logs <pod-name>"
    echo "   kubectl describe pod <pod-name>"
    echo "   kubectl describe service upscale-banking"
fi
