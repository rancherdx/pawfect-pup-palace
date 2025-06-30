
# Deployment Checklist

## Pre-Deployment Requirements

### 1. Environment Variables (Set in Cloudflare Workers)
```bash
# Required Secrets
JWT_SECRET=your-strong-256-bit-secret-key
ENCRYPTION_KEY_SECRET=your-encryption-key-secret
ADMIN_EMAIL=admin@yourdomain.com

# Optional but Recommended
SQUARE_ACCESS_TOKEN=your-square-access-token
SQUARE_LOCATION_ID=your-square-location-id
SQUARE_WEBHOOK_SIGNATURE_KEY=your-square-webhook-signature
SENDGRID_API_KEY=your-sendgrid-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
```

### 2. Database Setup
- Ensure D1 database is created and bound to PUPPIES_DB
- Run database migrations if any schema changes exist
- Verify seed data is properly loaded

### 3. Storage Setup
- R2 bucket for STATIC_ASSETS is configured
- R2 bucket for PUPPY_IMAGES is configured
- Proper CORS settings are applied

### 4. Build Process
```bash
# Build frontend
npm run build

# Deploy to Cloudflare
wrangler deploy
```

### 5. Post-Deployment Verification
- [ ] User registration works
- [ ] User login works
- [ ] Admin dashboard is accessible
- [ ] Puppy/Litter management functions
- [ ] API endpoints respond correctly
- [ ] Static assets load properly
- [ ] CORS headers are set correctly

## API Endpoints to Test
- GET /api/puppies
- GET /api/litters
- POST /api/auth/login
- POST /api/auth/register
- GET /api/users/me (authenticated)
- GET /admin/litters (admin authenticated)

## Security Checklist
- [ ] JWT_SECRET is cryptographically strong
- [ ] Admin routes require authentication
- [ ] CORS is properly configured
- [ ] No sensitive data in client-side code
- [ ] Environment variables are not logged

## Performance Optimizations
- [ ] Static assets have proper cache headers
- [ ] API responses are properly cached where appropriate
- [ ] Database queries are optimized
- [ ] Images are properly optimized and served

## Monitoring
- [ ] Error logging is configured
- [ ] Performance monitoring is set up
- [ ] Health check endpoint is working (/health)
