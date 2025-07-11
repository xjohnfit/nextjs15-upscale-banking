#!/bin/bash

# Kubernetes Troubleshooting Script for Upscale Banking App

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Kubernetes Troubleshooting for Upscale Banking App${NC}"
echo "========================================================"

# 1. Check if kubectl is available
echo -e "\n${YELLOW}1. Checking kubectl availability:${NC}"
if command -v kubectl &> /dev/null; then
    echo -e "${GREEN}✅ kubectl is available${NC}"
    kubectl version --client --short 2>/dev/null || echo "kubectl client version check failed"
else
    echo -e "${RED}❌ kubectl not found - install kubectl first${NC}"
    exit 1
fi

# 2. Check cluster connection
echo -e "\n${YELLOW}2. Checking cluster connection:${NC}"
if kubectl cluster-info &>/dev/null; then
    echo -e "${GREEN}✅ Connected to Kubernetes cluster${NC}"
else
    echo -e "${RED}❌ Cannot connect to Kubernetes cluster${NC}"
    echo "Check your kubeconfig or cluster setup"
fi

# 3. Check namespaces
echo -e "\n${YELLOW}3. Current namespace:${NC}"
CURRENT_NS=$(kubectl config view --minify --output 'jsonpath={..namespace}')
if [ -z "$CURRENT_NS" ]; then
    CURRENT_NS="default"
fi
echo "Using namespace: $CURRENT_NS"

# 4. Check deployments
echo -e "\n${YELLOW}4. Checking deployments:${NC}"
if kubectl get deployments 2>/dev/null | grep -q upscale; then
    kubectl get deployments | grep upscale
    echo -e "${GREEN}✅ Upscale banking deployment found${NC}"
else
    echo -e "${RED}❌ No upscale banking deployment found${NC}"
    echo -e "${YELLOW}💡 Deploy your app first: kubectl apply -f kubernetes/deployment.yml${NC}"
fi

# 5. Check pods
echo -e "\n${YELLOW}5. Checking pods:${NC}"
PODS=$(kubectl get pods 2>/dev/null | grep upscale | head -5)
if [ -n "$PODS" ]; then
    echo "$PODS"
    
    # Check pod status
    RUNNING_PODS=$(kubectl get pods 2>/dev/null | grep upscale | grep Running | wc -l)
    if [ "$RUNNING_PODS" -gt 0 ]; then
        echo -e "${GREEN}✅ $RUNNING_PODS upscale banking pod(s) running${NC}"
    else
        echo -e "${RED}❌ No running upscale banking pods${NC}"
        echo -e "${YELLOW}💡 Check pod logs: kubectl logs <pod-name>${NC}"
    fi
else
    echo -e "${RED}❌ No upscale banking pods found${NC}"
fi

# 6. Check services
echo -e "\n${YELLOW}6. Checking services:${NC}"
SERVICES=$(kubectl get services 2>/dev/null | grep upscale)
if [ -n "$SERVICES" ]; then
    echo "$SERVICES"
    echo -e "${GREEN}✅ Upscale banking service found${NC}"
    
    # Check if NodePort 30000 is configured
    if kubectl get services 2>/dev/null | grep upscale | grep -q 30000; then
        echo -e "${GREEN}✅ NodePort 30000 is configured${NC}"
    else
        echo -e "${RED}❌ NodePort 30000 not found in service${NC}"
        echo -e "${YELLOW}💡 Check service configuration${NC}"
    fi
else
    echo -e "${RED}❌ No upscale banking service found${NC}"
    echo -e "${YELLOW}💡 Deploy service: kubectl apply -f kubernetes/service.yml${NC}"
fi

# 7. Check port configuration
echo -e "\n${YELLOW}7. Checking port configuration:${NC}"
if [ -f "kubernetes/service.yml" ]; then
    TARGET_PORT=$(grep "targetPort:" kubernetes/service.yml | awk '{print $2}')
    NODE_PORT=$(grep "nodePort:" kubernetes/service.yml | awk '{print $2}')
    echo "Service targetPort: $TARGET_PORT"
    echo "Service nodePort: $NODE_PORT"
    
    if [ "$TARGET_PORT" != "3000" ]; then
        echo -e "${YELLOW}⚠️  Warning: targetPort is $TARGET_PORT, but Next.js usually runs on 3000${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  kubernetes/service.yml not found in current directory${NC}"
fi

# 8. Test internal connectivity
echo -e "\n${YELLOW}8. Testing internal connectivity:${NC}"
POD_NAME=$(kubectl get pods 2>/dev/null | grep upscale | grep Running | head -1 | awk '{print $1}')
if [ -n "$POD_NAME" ]; then
    echo "Testing pod: $POD_NAME"
    
    # Test if app responds inside the pod
    echo "Testing port 3000 inside pod..."
    if kubectl exec $POD_NAME -- curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "200\|404\|302"; then
        echo -e "${GREEN}✅ App responds on port 3000 inside pod${NC}"
    else
        echo -e "${RED}❌ App not responding on port 3000 inside pod${NC}"
        
        echo "Testing port 5004 inside pod..."
        if kubectl exec $POD_NAME -- curl -s -o /dev/null -w "%{http_code}" http://localhost:5004 2>/dev/null | grep -q "200\|404\|302"; then
            echo -e "${GREEN}✅ App responds on port 5004 inside pod${NC}"
        else
            echo -e "${RED}❌ App not responding on port 5004 inside pod${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  No running pods to test${NC}"
fi

# 9. Test NodePort from host
echo -e "\n${YELLOW}9. Testing NodePort accessibility:${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:30000 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ NodePort 30000 is accessible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ NodePort 30000 is not accessible${NC}"
    echo "HTTP response code: $HTTP_CODE"
fi

# 10. Show recent pod logs
echo -e "\n${YELLOW}10. Recent pod logs (last 10 lines):${NC}"
if [ -n "$POD_NAME" ]; then
    echo "Logs from $POD_NAME:"
    kubectl logs $POD_NAME --tail=10 2>/dev/null || echo "Could not retrieve logs"
else
    echo -e "${YELLOW}⚠️  No running pods to show logs${NC}"
fi

# 11. Recommendations
echo -e "\n${BLUE}📋 Recommendations:${NC}"

if [ -z "$PODS" ]; then
    echo -e "${YELLOW}🔧 Deploy your application:${NC}"
    echo "   kubectl apply -f kubernetes/deployment.yml"
    echo "   kubectl apply -f kubernetes/service.yml"
fi

if [ "$TARGET_PORT" != "3000" ] && [ -n "$TARGET_PORT" ]; then
    echo -e "\n${YELLOW}🔧 Fix port configuration:${NC}"
    echo "   Your service.yml has targetPort: $TARGET_PORT"
    echo "   But Next.js typically runs on port 3000"
    echo "   Update service.yml to use targetPort: 3000"
    echo "   OR ensure your app runs on port $TARGET_PORT"
fi

if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "404" ] && [ "$HTTP_CODE" != "302" ]; then
    echo -e "\n${YELLOW}🔧 Troubleshoot connectivity:${NC}"
    echo "   1. Check firewall: sudo ufw status"
    echo "   2. Check if port 30000 is bound: netstat -tlnp | grep 30000"
    echo "   3. Restart kubelet: sudo systemctl restart kubelet"
fi

echo -e "\n${GREEN}✅ Troubleshooting complete!${NC}"
echo -e "${BLUE}💡 Run this script again after making changes${NC}"
