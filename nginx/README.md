# Nginx Setup for Upscale Banking App

This directory contains Nginx configuration and setup scripts for deploying your Upscale Banking app with a custom domain and SSL.

## 📁 Files Overview

- `upscale-banking.conf` - Main Nginx configuration file
- `setup-nginx.sh` - Initial Nginx installation and configuration script
- `setup-ssl.sh` - SSL certificate setup script (Let's Encrypt)
- `diagnose.sh` - DNS and connectivity diagnostic script
- `monitor.sh` - Service monitoring and status checking script

## 🚀 Setup Instructions

### Step 1: Domain Configuration
1. Point your domain's A record to your VPS IP: `46.202.89.158`
2. Wait for DNS propagation (can take up to 24 hours, usually much faster)

### Step 2: Upload Files to VPS
Upload the nginx directory to your VPS:
```bash
scp -r nginx/ user@46.202.89.158:~/
```

### Step 3: Run Initial Setup
Connect to your VPS and run the setup script:
```bash
ssh user@46.202.89.158
cd nginx/
chmod +x *.sh
sudo ./setup-nginx.sh
```

### Step 4: Update Domain Configuration
Replace `yourdomain.com` with your actual domain in the Nginx config:
```bash
sudo nano /etc/nginx/sites-available/upscale-banking
# Replace all instances of 'yourdomain.com' with your domain
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

### Step 5: Test HTTP Access
Your app should now be accessible at:
- `http://yourdomain.com`
- `http://www.yourdomain.com`

### Step 6: Setup SSL (HTTPS)
Once your domain is pointing to your server and HTTP is working:
```bash
./setup-ssl.sh yourdomain.com
```

This will:
- Obtain SSL certificates from Let's Encrypt
- Update Nginx configuration for HTTPS
- Set up automatic certificate renewal
- Enable HTTP to HTTPS redirects

## 🔧 Configuration Details

### Nginx Features Enabled
- ✅ Reverse proxy to your Kubernetes app (port 30000)
- ✅ Gzip compression for better performance
- ✅ Security headers (XSS protection, frame options, etc.)
- ✅ Static asset caching for Next.js
- ✅ Proper proxy headers for real IP forwarding
- ✅ SSL/TLS configuration ready
- ✅ HTTP to HTTPS redirects
- ✅ Error and access logging

### Load Balancing
If you scale your Kubernetes deployment to multiple replicas, you can add more backend servers in the upstream block:
```nginx
upstream nextjs_backend {
    server 127.0.0.1:30000;
    server 127.0.0.1:30001;  # Add more as needed
    server 127.0.0.1:30002;
}
```

## 📊 Monitoring and Diagnostics

### Quick Diagnostic
If you're having issues, run the diagnostic script first:
```bash
./diagnose.sh
```

This will automatically check:
- DNS resolution for your domain
- Server connectivity
- App accessibility on port 30000
- Nginx configuration and status
- Provide specific recommendations

### Detailed Monitoring
Use the monitoring script to check service status:
```bash
./monitor.sh
```

This shows:
- Nginx status and configuration validity
- Kubernetes pods status
- App accessibility
- SSL certificate status
- Recent logs
- System resources

## 🔍 Troubleshooting

### Domain Not Resolving (curl: Could not resolve host)
This means DNS is not set up correctly. Check these steps:

1. **Verify domain ownership and DNS settings:**
   ```bash
   # Check if domain resolves to your server IP
   nslookup upscalebanking.com
   dig upscalebanking.com
   
   # Should return: 46.202.89.158
   ```

2. **If domain doesn't resolve, you need to:**
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add an A record: `upscalebanking.com` → `46.202.89.158`
   - Add an A record: `www.upscalebanking.com` → `46.202.89.158`
   - Wait for DNS propagation (5 minutes to 24 hours)

3. **Test with IP address first:**
   ```bash
   # Test that Nginx is working with IP
   curl -H "Host: upscalebanking.com" http://46.202.89.158
   ```

4. **Check DNS propagation globally:**
   - Visit: https://www.whatsmydns.net/
   - Enter your domain: `upscalebanking.com`
   - Check if it shows `46.202.89.158` worldwide

### App Not Accessible
1. Check if your Kubernetes app is running:
   ```bash
   kubectl get pods
   kubectl get services
   ```

2. Verify the app responds on port 30000:
   ```bash
   curl http://localhost:30000
   ```

3. Check Nginx status:
   ```bash
   sudo systemctl status nginx
   sudo nginx -t
   ```

### SSL Issues
1. Verify domain DNS is pointing to your server:
   ```bash
   nslookup yourdomain.com
   ```

2. Check SSL certificate status:
   ```bash
   sudo certbot certificates
   ```

3. Test certificate renewal:
   ```bash
   sudo certbot renew --dry-run
   ```

### Performance Issues
1. Check system resources:
   ```bash
   htop
   df -h
   ```

2. Monitor real-time logs:
   ```bash
   sudo tail -f /var/log/nginx/upscale-banking.access.log
   ```

## 📝 Log Files
- Access logs: `/var/log/nginx/upscale-banking.access.log`
- Error logs: `/var/log/nginx/upscale-banking.error.log`
- Nginx main logs: `/var/log/nginx/error.log`

## 🔒 Security Considerations

The configuration includes:
- Security headers to prevent XSS, clickjacking, etc.
- Proper SSL/TLS configuration
- Rate limiting ready (can be enabled if needed)
- Client body size limits
- Real IP forwarding for proper logging

## 🔄 Updates and Maintenance

### Updating Nginx Configuration
1. Edit the configuration:
   ```bash
   sudo nano /etc/nginx/sites-available/upscale-banking
   ```

2. Test and reload:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### SSL Certificate Renewal
Certificates auto-renew, but you can manually trigger renewal:
```bash
sudo certbot renew
```

### Nginx Updates
Keep Nginx updated:
```bash
sudo apt update && sudo apt upgrade nginx
```

## 🌐 Domain Examples

Replace `yourdomain.com` with your actual domain throughout the configuration. For example:
- `banking.example.com`
- `app.mycompany.com`
- `upscale-banking.mydomain.com`

Make sure to update both the main domain and www subdomain in the configuration.

## ☁️ Production Considerations

For production environments, consider:
- Setting up monitoring (Prometheus/Grafana)
- Implementing rate limiting
- Adding a CDN (Cloudflare, AWS CloudFront)
- Database connection pooling
- Log rotation and management
- Backup strategies
- Health checks and auto-scaling

Your Upscale Banking app is now ready for production with a professional domain and SSL setup! 🚀
