# Production Authentication Debugging Guide

## Quick Debug Steps for Production

### 1. Check Environment
Visit: `https://yourdomain.com/api/debug-production`

This will show:
- Environment configuration
- Cookie status
- Request headers
- Appwrite configuration status

### 2. Test Cookie Setting
On sign-in or sign-up page, use the "Production Debug Tools" panel:
- Click "Check Environment" first
- Click "Test Production Auth" to test cookie setting
- Click "Check Auth Status" to verify authentication state

### 3. Common Production Issues

#### Issue: Cookies not being set
**Symptoms**: `sessionExists: false` in debug endpoint

**Possible Causes**:
1. **HTTPS/HTTP mismatch**: Check if `secure` flag matches your deployment
2. **Domain issues**: Subdomains or www/non-www redirects
3. **Proxy/Load balancer**: Headers being stripped

**Solutions**:
```javascript
// Check if these match your production setup:
secure: process.env.NODE_ENV === 'production'  // Should be true for HTTPS
sameSite: 'lax'  // More permissive than 'strict'
domain: undefined  // Let browser decide
```

#### Issue: Authentication succeeds but redirect fails
**Symptoms**: User logged in but stays on auth page

**Possible Causes**:
1. **Client-side routing issues**: Next.js router vs window.location
2. **Middleware conflicts**: Check middleware logs
3. **Base URL issues**: Relative vs absolute URLs

**Solutions**:
- Use `window.location.href = '/'` instead of `router.push('/')`
- Check middleware is not blocking redirects
- Verify base URL configuration

#### Issue: Session expires immediately
**Symptoms**: User logged out on page refresh

**Possible Causes**:
1. **Cookie persistence**: maxAge not set correctly
2. **Session validation**: Appwrite session validation failing
3. **Clock sync**: Server time differences

### 4. Check Server Logs

Look for these log patterns:
```
[PROD-AUTH-TEST] - Production auth test logs
=== SIGN IN DEBUG START === - Detailed auth flow
[MIDDLEWARE] - Request routing logs
```

### 5. Browser Developer Tools

1. **Network Tab**: Check if auth requests return 200
2. **Application Tab > Cookies**: Verify cookies are set with correct flags
3. **Console**: Look for JavaScript errors during redirect

### 6. Environment Variables

Ensure these are set in production:
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-server
NEXT_PUBLIC_APPWRITE_PROJECT=your-project-id
NEXT_APPWRITE_KEY=your-api-key
APPWRITE_DATABASE_ID=your-database-id
APPWRITE_USER_COLLECTION_ID=your-user-collection-id
```

### 7. Kubernetes/Docker Specific

If using Kubernetes:
```yaml
# Check if these are properly set in your deployment
env:
  - name: NODE_ENV
    value: "production"
  - name: NEXT_PUBLIC_APPWRITE_ENDPOINT
    value: "https://your-appwrite-server"
```

### 8. Debug URLs

Available debug endpoints:
- `/api/debug-production` - Environment info
- `/api/auth-status` - Current auth status
- `/api/test-production-auth` - Cookie setting test

### 9. Quick Fix Checklist

- [ ] HTTPS enabled and working
- [ ] Environment variables set correctly
- [ ] No middleware blocking auth routes
- [ ] Cookie domain matches deployment domain
- [ ] Appwrite server accessible from production
- [ ] No CORS issues with Appwrite
- [ ] Session tokens not being cached incorrectly

### 10. Emergency Rollback

If needed, you can temporarily bypass auth:
1. Comment out middleware redirects
2. Remove authentication checks in layouts
3. Deploy minimal auth-free version
4. Debug in staging environment
