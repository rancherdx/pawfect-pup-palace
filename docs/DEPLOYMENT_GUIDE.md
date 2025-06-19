
# Comprehensive Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Puppy Breeder Management System to production, including frontend assets to Cloudflare R2 and backend services to Cloudflare Workers.

## Prerequisites

### Required Accounts
- [Cloudflare Account](https://dash.cloudflare.com/sign-up) with Workers and R2 enabled
- [Square Developer Account](https://developer.squareup.com/) for payment processing
- [Google Cloud Platform Account](https://console.cloud.google.com/) for email services
- Domain name (for custom domain setup)

### Required Tools
```bash
# Install Node.js and npm
node --version  # v18+ required
npm --version   # v8+ required

# Install Wrangler CLI
npm install -g wrangler

# Verify installation
wrangler --version
```

## Phase 1: Environment Setup

### 1.1 Cloudflare Workers Configuration

```bash
# Authenticate with Cloudflare
wrangler login

# Create or configure wrangler.toml
wrangler init my-puppy-app

# Set up D1 database
wrangler d1 create puppy-database
wrangler d1 execute puppy-database --file=master_schema.sql
wrangler d1 execute puppy-database --file=master_seed.sql

# Create R2 buckets
wrangler r2 bucket create puppy-images
wrangler r2 bucket create frontend-assets
wrangler r2 bucket create static-content
```

### 1.2 Environment Secrets Configuration

Set up all required secrets using Wrangler:

```bash
# Core Authentication
wrangler secret put JWT_SECRET
# Enter: A strong 256-bit secret key (64 characters)

# Payment Processing (Square)
wrangler secret put SQUARE_ACCESS_TOKEN
# Enter: Your Square access token from developer dashboard

wrangler secret put SQUARE_LOCATION_ID
# Enter: Your Square location ID

wrangler secret put SQUARE_WEBHOOK_SIGNATURE_KEY
# Enter: Webhook signature key from Square

# Security
wrangler secret put ENCRYPTION_KEY_SECRET
# Enter: 64-character hexadecimal string for AES-256-GCM

wrangler secret put INTERNAL_WEBHOOK_SECRET
# Enter: Strong random string for webhook verification

# Admin Configuration
wrangler secret put ADMIN_EMAIL
# Enter: admin@yourdomain.com

wrangler secret put ADMIN_DASHBOARD_URL
# Enter: https://yourdomain.com/admin

# Optional: Marketing & Analytics
wrangler secret put AFFILIATE_TRACKING_SECRET
wrangler secret put SEO_API_KEY
```

### 1.3 Verify wrangler.toml Configuration

```toml
name = "puppy-breeder-api"
main = "src/worker/index.ts"
compatibility_date = "2024-06-19"

[env.production]
  name = "puppy-breeder-api"
  
[[env.production.d1_databases]]
  binding = "PUPPIES_DB"
  database_name = "puppy-database"
  database_id = "your-database-id"

[[env.production.r2_buckets]]
  binding = "PUPPY_IMAGES"
  bucket_name = "puppy-images"

[[env.production.r2_buckets]]
  binding = "STATIC_ASSETS"
  bucket_name = "frontend-assets"

[env.production.vars]
  ENV = "production"
  ENVIRONMENT_NAME = "production"
```

## Phase 2: Backend Deployment

### 2.1 Deploy Worker to Production

```bash
# Build and deploy worker
npm run build:worker
wrangler deploy --env production

# Verify deployment
curl https://your-worker-domain.workers.dev/api/system/status
```

### 2.2 Configure Custom Domain (Optional)

```bash
# Add custom domain to worker
wrangler route add "api.yourdomain.com/*" puppy-breeder-api --env production

# Set up DNS records in Cloudflare dashboard:
# CNAME api.yourdomain.com -> your-worker-domain.workers.dev
```

### 2.3 Set up Database Migrations

```bash
# Run production migrations
wrangler d1 execute puppy-database --env production --file=src/worker/schema.sql
wrangler d1 execute puppy-database --env production --file=src/worker/seed.sql

# Verify database setup
wrangler d1 execute puppy-database --env production --command="SELECT COUNT(*) FROM users;"
```

## Phase 3: Frontend Build and Deployment

### 3.1 Configure Frontend Environment

Create production environment file:

```bash
# .env.production
VITE_API_URL=https://your-worker-domain.workers.dev/api
VITE_APP_URL=https://yourdomain.com
VITE_SQUARE_APPLICATION_ID=your-square-app-id
VITE_SQUARE_ENVIRONMENT=production
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

### 3.2 Build Frontend Assets

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Verify build output
ls -la dist/
```

### 3.3 Deploy to R2 Bucket

```bash
# Upload frontend assets to R2
wrangler r2 object put frontend-assets/index.html --file=dist/index.html --content-type="text/html"
wrangler r2 object put frontend-assets/manifest.json --file=dist/manifest.json --content-type="application/json"

# Upload all static assets
find dist -type f -name "*.js" -exec wrangler r2 object put frontend-assets/{} --file={} --content-type="application/javascript" \;
find dist -type f -name "*.css" -exec wrangler r2 object put frontend-assets/{} --file={} --content-type="text/css" \;
find dist -type f -name "*.html" -exec wrangler r2 object put frontend-assets/{} --file={} --content-type="text/html" \;
find dist -type f -name "*.ico" -exec wrangler r2 object put frontend-assets/{} --file={} --content-type="image/x-icon" \;
find dist -type f -name "*.png" -exec wrangler r2 object put frontend-assets/{} --file={} --content-type="image/png" \;
find dist -type f -name "*.svg" -exec wrangler r2 object put frontend-assets/{} --file={} --content-type="image/svg+xml" \;
```

### 3.4 Automated Deployment Script

Create deployment script:

```bash
#!/bin/bash
# deploy.sh

echo "Building frontend assets..."
npm run build

echo "Deploying to R2..."
# Sync entire dist folder to R2
for file in $(find dist -type f); do
  # Remove 'dist/' prefix for R2 path
  r2_path=${file#dist/}
  
  # Determine content type
  case "$file" in
    *.html) content_type="text/html" ;;
    *.js) content_type="application/javascript" ;;
    *.css) content_type="text/css" ;;
    *.json) content_type="application/json" ;;
    *.png) content_type="image/png" ;;
    *.svg) content_type="image/svg+xml" ;;
    *.ico) content_type="image/x-icon" ;;
    *) content_type="application/octet-stream" ;;
  esac
  
  echo "Uploading $file to frontend-assets/$r2_path"
  wrangler r2 object put "frontend-assets/$r2_path" --file="$file" --content-type="$content_type"
done

echo "Deployment complete!"

# Make script executable
chmod +x deploy.sh
```

## Phase 4: R2 Bucket Configuration

### 4.1 Configure CORS for Puppy Images

```bash
# Create CORS configuration file
cat > cors-config.json << EOF
{
  "cors_rules": [
    {
      "allowed_origins": ["https://yourdomain.com", "https://api.yourdomain.com"],
      "allowed_methods": ["GET", "POST", "PUT", "DELETE"],
      "allowed_headers": ["*"],
      "expose_headers": ["*"],
      "max_age_seconds": 3600
    }
  ]
}
EOF

# Apply CORS configuration
wrangler r2 bucket cors put puppy-images --file=cors-config.json
```

### 4.2 Set Up Public Access for Frontend Assets

```bash
# Make frontend assets publicly readable
wrangler r2 bucket public-access put frontend-assets --public-read

# Verify public access
curl https://frontend-assets.your-account-id.r2.cloudflarestorage.com/index.html
```

### 4.3 Configure Custom Domain for Assets (Optional)

```bash
# Add custom domain for R2 bucket
# In Cloudflare dashboard:
# 1. Go to R2 → Manage custom domains
# 2. Add domain: assets.yourdomain.com
# 3. Create DNS CNAME record: assets.yourdomain.com → bucket-endpoint
```

## Phase 5: Third-Party Service Configuration

### 5.1 Square Payment Setup

1. **Production Configuration**:
   ```bash
   # In Square Developer Dashboard:
   # 1. Switch to Production mode
   # 2. Generate production access token
   # 3. Configure webhook endpoints:
   #    - https://your-worker-domain.workers.dev/api/webhooks/square
   # 4. Copy webhook signature key
   ```

2. **Webhook Verification**:
   ```bash
   # Test webhook endpoint
   curl -X POST https://your-worker-domain.workers.dev/api/webhooks/square \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

### 5.2 Google Workspace Integration

1. **OAuth Setup**:
   ```bash
   # In Google Cloud Console:
   # 1. Create OAuth 2.0 credentials
   # 2. Add authorized redirect URIs:
   #    - https://yourdomain.com/auth/google/callback
   # 3. Enable Gmail API, Calendar API, Drive API
   ```

2. **Service Account Configuration**:
   ```bash
   # Upload service account key to worker
   wrangler secret put GOOGLE_SERVICE_ACCOUNT_KEY
   # Paste JSON content of service account key file
   ```

### 5.3 Analytics Setup

```bash
# Google Analytics 4
# 1. Create GA4 property
# 2. Copy Measurement ID
# 3. Add tracking code to frontend

# Set up conversion tracking for:
# - Puppy inquiry forms
# - Adoption completions
# - Newsletter signups
```

## Phase 6: Domain and SSL Configuration

### 6.1 Custom Domain Setup

```bash
# Add domain to Cloudflare
# 1. Add site to Cloudflare dashboard
# 2. Update nameservers at domain registrar
# 3. Wait for DNS propagation (24-48 hours)

# Configure DNS records:
# A record: yourdomain.com → worker IP
# CNAME: www.yourdomain.com → yourdomain.com
# CNAME: api.yourdomain.com → worker-domain.workers.dev
# CNAME: assets.yourdomain.com → r2-bucket-domain
```

### 6.2 SSL Certificate

```bash
# Cloudflare automatically provides SSL certificates
# Verify SSL configuration:
curl -I https://yourdomain.com
curl -I https://api.yourdomain.com
```

## Phase 7: Monitoring and Maintenance

### 7.1 Set Up Monitoring

```bash
# Configure Cloudflare Analytics
# 1. Enable Web Analytics in dashboard
# 2. Set up custom metrics for:
#    - API response times
#    - Error rates
#    - Payment success rates
#    - User engagement metrics
```

### 7.2 Backup Configuration

```bash
# Automated database backups
wrangler d1 backup create puppy-database --env production

# R2 bucket backup strategy
# 1. Enable versioning on critical buckets
# 2. Set up lifecycle policies for old versions
# 3. Cross-region replication for disaster recovery
```

### 7.3 Regular Maintenance Tasks

```bash
# Weekly tasks:
# - Review error logs
# - Check API performance metrics
# - Verify payment processing
# - Update security patches

# Monthly tasks:
# - Rotate API keys and secrets
# - Review and optimize database queries
# - Analyze user behavior data
# - Update documentation
```

## Phase 8: Performance Optimization

### 8.1 CDN Configuration

```bash
# Optimize Cloudflare settings:
# 1. Enable Auto Minify for CSS, JS, HTML
# 2. Set up Page Rules for caching
# 3. Enable Brotli compression
# 4. Configure Browser Cache TTL
```

### 8.2 Image Optimization

```bash
# R2 + Cloudflare Images integration
# 1. Enable Image Resizing
# 2. Set up variants for different screen sizes
# 3. Configure WebP/AVIF format delivery
# 4. Implement lazy loading for puppy galleries
```

## Troubleshooting

### Common Deployment Issues

1. **Worker Deploy Failures**:
   ```bash
   # Check syntax errors
   npm run build
   # Verify environment variables
   wrangler secret list
   ```

2. **R2 Upload Issues**:
   ```bash
   # Check file permissions
   ls -la dist/
   # Verify bucket access
   wrangler r2 bucket list
   ```

3. **Domain Resolution Problems**:
   ```bash
   # Check DNS propagation
   dig yourdomain.com
   nslookup api.yourdomain.com
   ```

4. **SSL Certificate Issues**:
   ```bash
   # Force SSL certificate refresh
   # In Cloudflare dashboard: SSL/TLS → Edge Certificates → Universal SSL
   ```

### Performance Issues

1. **Slow API Responses**:
   - Check database query performance
   - Review worker memory usage
   - Optimize database indexes

2. **Frontend Loading Issues**:
   - Verify R2 bucket configuration
   - Check CDN cache settings
   - Optimize asset compression

### Security Audits

```bash
# Regular security checks:
# 1. Review access logs for suspicious activity
# 2. Verify all secrets are properly secured
# 3. Check for outdated dependencies
# 4. Run automated security scans
```

## Post-Deployment Checklist

- [ ] Worker deployed and accessible
- [ ] Database migrated and seeded
- [ ] Frontend assets uploaded to R2
- [ ] Custom domains configured
- [ ] SSL certificates active
- [ ] Payment processing tested
- [ ] Email services configured
- [ ] Analytics tracking verified
- [ ] Monitoring and alerts set up
- [ ] Backup procedures tested
- [ ] Performance optimization complete
- [ ] Security audit passed
- [ ] Documentation updated

## Support and Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Square Developer Documentation](https://developer.squareup.com/docs)
- [Google Cloud Documentation](https://cloud.google.com/docs)

For additional support, contact the development team or create an issue in the project repository.
