#!/bin/bash

# Comprehensive Kubernetes Diagnostic Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Kubernetes Connection Troubleshooting${NC}"
echo "==========================================="

# 1. Check kubectl connection
echo -e "\n${YELLOW}1. Checking Kubernetes cluster connection:${NC}"
if kubectl cluster-info &>/dev/null; then
    echo -e "${GREEN}✅ Connected to Kubernetes cluster${NC}"
    kubectl cluster-info | head -2
else
    echo -e "${RED}❌ Cannot connect to Kubernetes cluster${NC}"
    echo "Check if Kubernetes is running: systemctl status kubelet"
    exit 1
fi

# 2. Check current namespace
echo -e "\n${YELLOW}2. Current namespace and context:${NC}"
kubectl config current-context
CURRENT_NS=$(kubectl config view --minify --output 'jsonpath={..namespace}' 2>/dev/null)
if [ -z "$CURRENT_NS" ]; then
    CURRENT_NS="default"
fi
echo "Namespace: $CURRENT_NS"

# 3. Check all deployments
echo -e "\n${YELLOW}3. All deployments:${NC}"
kubectl get deployments -o wide

# 4. Check all services
echo -e "\n${YELLOW}4. All services:${NC}"
kubectl get services -o wide

# 5. Check all pods
echo -e "\n${YELLOW}5. All pods:${NC}"
kubectl get pods -o wide

# 6. Check specific upscale resources
echo -e "\n${YELLOW}6. Upscale Banking specific resources:${NC}"
echo "--- Upscale Deployments ---"
kubectl get deployments | grep -i upscale || echo "No upscale deployments found"

echo "--- Upscale Services ---"
kubectl get services | grep -i upscale || echo "No upscale services found"

echo "--- Upscale Pods ---"
kubectl get pods | grep -i upscale || echo "No upscale pods found"

# 7. Check pod details if they exist
UPSCALE_PODS=$(kubectl get pods 2>/dev/null | grep -i upscale | awk '{print $1}')
if [ -n "$UPSCALE_PODS" ]; then
    echo -e "\n${YELLOW}7. Pod details:${NC}"
    for pod in $UPSCALE_PODS; do
        echo "--- Pod: $pod ---"
        kubectl describe pod $pod | grep -E "(Status|Ready|Conditions|Events)" -A 5
        echo ""
        echo "Pod logs (last 10 lines):"
        kubectl logs $pod --tail=10 2>/dev/null || echo "Could not retrieve logs"
        echo ""
    done
else
    echo -e "\n${YELLOW}7. No upscale pods to check${NC}"
fi

# 8. Check service details
UPSCALE_SERVICE=$(kubectl get services 2>/dev/null | grep -i upscale | awk '{print $1}' | head -1)
if [ -n "$UPSCALE_SERVICE" ]; then
    echo -e "\n${YELLOW}8. Service details:${NC}"
    kubectl describe service $UPSCALE_SERVICE
else
    echo -e "\n${YELLOW}8. No upscale service found${NC}"
fi

# 9. Check node ports
echo -e "\n${YELLOW}9. Checking NodePorts on the system:${NC}"
echo "All NodePort services:"
kubectl get services --all-namespaces | grep NodePort || echo "No NodePort services found"

echo ""
echo "Checking if port 30000 is bound on the system:"
netstat -tlnp 2>/dev/null | grep :30000 || echo "Port 30000 not bound"

echo ""
echo "Checking what's listening on all ports:"
netstat -tlnp 2>/dev/null | grep -E ":(30[0-9]{3}|3[0-9]{4})" || echo "No ports in 30000+ range found"

# 10. Check firewall
echo -e "\n${YELLOW}10. Checking firewall status:${NC}"
if command -v ufw &> /dev/null; then
    echo "UFW Status:"
    ufw status 2>/dev/null || echo "Could not check UFW status"
fi

if command -v iptables &> /dev/null; then
    echo "Checking iptables for port 30000:"
    iptables -L | grep 30000 || echo "No iptables rules for port 30000"
fi

# 11. Check kubelet and other services
echo -e "\n${YELLOW}11. Kubernetes system status:${NC}"
echo "Kubelet status:"
systemctl is-active kubelet 2>/dev/null && echo "✅ kubelet active" || echo "❌ kubelet not active"

echo "Docker status:"
systemctl is-active docker 2>/dev/null && echo "✅ docker active" || echo "❌ docker not active"

if command -v k3s &> /dev/null; then
    echo "K3s status:"
    systemctl is-active k3s 2>/dev/null && echo "✅ k3s active" || echo "❌ k3s not active"
fi

# 12. Check if files exist and are correct
echo -e "\n${YELLOW}12. Checking configuration files:${NC}"
if [ -f "kubernetes/deployment.yml" ]; then
    echo "✅ deployment.yml exists"
    echo "Image: $(grep 'image:' kubernetes/deployment.yml | awk '{print $2}')"
    echo "Container Port: $(grep 'containerPort:' kubernetes/deployment.yml | awk '{print $2}')"
else
    echo "❌ kubernetes/deployment.yml not found"
fi

if [ -f "kubernetes/service.yml" ]; then
    echo "✅ service.yml exists"
    echo "NodePort: $(grep 'nodePort:' kubernetes/service.yml | awk '{print $2}')"
    echo "TargetPort: $(grep 'targetPort:' kubernetes/service.yml | awk '{print $2}')"
else
    echo "❌ kubernetes/service.yml not found"
fi

# 13. Recommendations
echo -e "\n${BLUE}📋 Troubleshooting Recommendations:${NC}"

# Check if no resources exist
DEPLOYMENT_COUNT=$(kubectl get deployments 2>/dev/null | grep -c upscale || echo "0")
SERVICE_COUNT=$(kubectl get services 2>/dev/null | grep -c upscale || echo "0")

if [ "$DEPLOYMENT_COUNT" = "0" ] || [ "$SERVICE_COUNT" = "0" ]; then
    echo -e "\n${YELLOW}🔧 Deploy your application:${NC}"
    echo "   kubectl apply -f kubernetes/deployment.yml"
    echo "   kubectl apply -f kubernetes/service.yml"
fi

if ! netstat -tlnp 2>/dev/null | grep -q :30000; then
    echo -e "\n${YELLOW}🔧 Port 30000 is not bound. Try:${NC}"
    echo "   1. Restart kubelet: sudo systemctl restart kubelet"
    echo "   2. Check if K3s/K8s is running properly"
    echo "   3. Redeploy the service: kubectl delete service upscale-banking && kubectl apply -f kubernetes/service.yml"
fi

RUNNING_PODS=$(kubectl get pods 2>/dev/null | grep upscale | grep Running | wc -l)
if [ "$RUNNING_PODS" = "0" ]; then
    echo -e "\n${YELLOW}🔧 No running pods. Try:${NC}"
    echo "   1. Check pod logs: kubectl logs <pod-name>"
    echo "   2. Check pod events: kubectl describe pod <pod-name>"
    echo "   3. Delete and recreate: kubectl delete pods --all && kubectl apply -f kubernetes/deployment.yml"
fi

echo -e "\n${GREEN}✅ Diagnostic complete!${NC}"
