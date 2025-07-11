#!/bin/bash

# Quick Fix for Kubernetes Port Configuration
# This fixes the port mismatch in your service configuration

set -e

echo "🔧 Fixing Kubernetes service port configuration..."

# Backup current service file
if [ -f kubernetes/service.yml ]; then
    cp kubernetes/service.yml kubernetes/service.yml.backup.$(date +%Y%m%d_%H%M%S)
    echo "💾 Backup created: kubernetes/service.yml.backup.*"
else
    echo "❌ kubernetes/service.yml not found!"
    echo "Are you in the correct directory?"
    exit 1
fi

# Update targetPort from 5004 to 3000 (Next.js default)
echo "📝 Updating targetPort from 5004 to 3000..."
sed -i 's/targetPort: 5004/targetPort: 3000/' kubernetes/service.yml

# Show the changes
echo "✅ Updated service configuration:"
echo "---"
cat kubernetes/service.yml
echo "---"

# Apply the changes
echo "🚀 Applying updated service configuration..."
kubectl apply -f kubernetes/service.yml

# Wait a moment for the service to update
echo "⏳ Waiting for service to update..."
sleep 5

# Test the connection
echo "🧪 Testing connection..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:30000 2>/dev/null)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✅ Success! App is now accessible on port 30000 (HTTP $HTTP_CODE)"
    echo ""
    echo "🌐 Your app should now work at:"
    echo "   http://46.202.89.158:30000"
    echo "   http://upscalebanking.codewithxjohn.com"
else
    echo "❌ Still not accessible. HTTP code: $HTTP_CODE"
    echo ""
    echo "🔍 Run the debug script to investigate further:"
    echo "   ./k8s-debug.sh"
    echo ""
    echo "📋 Manual troubleshooting:"
    echo "   kubectl get pods"
    echo "   kubectl logs <pod-name>"
    echo "   kubectl describe service upscale-banking"
fi

echo ""
echo "📊 Current service status:"
kubectl get services | grep upscale || echo "No upscale service found"
