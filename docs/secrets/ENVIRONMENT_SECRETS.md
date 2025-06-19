
# Environment Secrets Documentation

## Overview
This document provides detailed information about all environment variables and secrets required for the Puppy Breeder Management System.

## Secret Categories

### 1. Backend Environment Secrets (Cloudflare Worker)

These secrets are stored in Cloudflare Workers using `wrangler secret put <SECRET_NAME>`:

#### Core Authentication & Security

| Secret Name | Purpose | Type | Example/Format | Required |
|-------------|---------|------|----------------|----------|
| `JWT_SECRET` | JWT token signing and verification | String (256-bit) | 64-character random string | ✅ Required |
| `ENCRYPTION_KEY_SECRET` | AES-256-GCM data encryption | Hex String | 64-character hexadecimal | ✅ Required |
| `INTERNAL_WEBHOOK_SECRET` | Internal webhook verification | String | Strong random string (32+ chars) | ✅ Required |

**Setup Instructions for Core Security:**
```bash
# Generate strong JWT secret (256-bit)
openssl rand -hex 32
wrangler secret put JWT_SECRET

# Generate encryption key (256-bit for AES-256)
openssl rand -hex 32
wrangler secret put ENCRYPTION_KEY_SECRET

# Generate webhook secret
openssl rand -base64 32
wrangler secret put INTERNAL_WEBHOOK_SECRET
```

#### Payment Processing (Square)

| Secret Name | Purpose | Type | Example/Format | Required |
|-------------|---------|------|----------------|----------|
| `SQUARE_ACCESS_TOKEN` | Square API authentication | Bearer Token | `sq0atp-...` (Production)<br>`sandbox-sq0atb-...` (Sandbox) | ✅ Required |
| `SQUARE_LOCATION_ID` | Square merchant location | String | `L8GGN8A5GY9C9` | ✅ Required |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | Square webhook verification | String | Base64 encoded key from Square | ✅ Required |

**Setup Instructions for Square:**
```bash
# From Square Developer Dashboard (https://developer.squareup.com/)
# 1. Create application or select existing
# 2. Generate access token (Production or Sandbox)
# 3. Copy Location ID from Locations tab
# 4. Set up webhook endpoint and copy signature key

wrangler secret put SQUARE_ACCESS_TOKEN
# Enter: Your access token from Square dashboard

wrangler secret put SQUARE_LOCATION_ID
# Enter: Location ID from Square dashboard

wrangler secret put SQUARE_WEBHOOK_SIGNATURE_KEY
# Enter: Webhook signature key from Square
```

#### Admin Configuration

| Secret Name | Purpose | Type | Example/Format | Required |
|-------------|---------|------|----------------|----------|
| `ADMIN_EMAIL` | Default admin account email | Email | `admin@yourdomain.com` | ✅ Required |
| `ADMIN_DASHBOARD_URL` | Admin dashboard base URL | URL | `https://yourdomain.com/admin` | ✅ Required |

**Setup Instructions for Admin:**
```bash
wrangler secret put ADMIN_EMAIL
# Enter: admin@yourdomain.com

wrangler secret put ADMIN_DASHBOARD_URL
# Enter: https://yourdomain.com/admin
```

#### Optional Marketing & Analytics

| Secret Name | Purpose | Type | Example/Format | Required |
|-------------|---------|------|----------------|----------|
| `AFFILIATE_TRACKING_SECRET` | Affiliate program security | String | Random string (32+ chars) | ❌ Optional |
| `SEO_API_KEY` | SEO service integration | API Key | Service-specific format | ❌ Optional |

### 2. Frontend Environment Variables

These are stored in `.env.production` file and built into the application:

#### Core Configuration

| Variable Name | Purpose | Type | Example/Format | Required |
|---------------|---------|------|----------------|----------|
| `VITE_API_URL` | Backend API base URL | URL | `https://api.yourdomain.com` | ✅ Required |
| `VITE_APP_URL` | Frontend application URL | URL | `https://yourdomain.com` | ✅ Required |

#### Google Services Integration

| Variable Name | Purpose | Type | Example/Format | Required |
|---------------|---------|------|----------------|----------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | String | `123456789-abc.apps.googleusercontent.com` | ✅ Required* |
| `VITE_GOOGLE_API_KEY` | Google APIs public key | String | `AIzaSyA...` | ✅ Required* |

*Required if using Google Workspace integration

**Setup Instructions for Google:**
```bash
# From Google Cloud Console (https://console.cloud.google.com/)
# 1. Create project or select existing
# 2. Enable Gmail API, Calendar API, Drive API
# 3. Create OAuth 2.0 credentials for web application
# 4. Add authorized origins and redirect URIs
# 5. Create API key with appropriate restrictions

# Add to .env.production:
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-api-key
```

#### Square Public Configuration

| Variable Name | Purpose | Type | Example/Format | Required |
|---------------|---------|------|----------------|----------|
| `VITE_SQUARE_APPLICATION_ID` | Square public app ID | String | `sq0idp-...` | ✅ Required |
| `VITE_SQUARE_ENVIRONMENT` | Square environment mode | Enum | `production` or `sandbox` | ✅ Required |

#### Analytics (Optional)

| Variable Name | Purpose | Type | Example/Format | Required |
|---------------|---------|------|----------------|----------|
| `VITE_GA_TRACKING_ID` | Google Analytics 4 ID | String | `G-XXXXXXXXXX` | ❌ Optional |
| `VITE_GTM_ID` | Google Tag Manager ID | String | `GTM-XXXXXXX` | ❌ Optional |

### 3. Admin Dashboard Configurable Integrations

These are configured through the admin interface and stored in the database:

#### Google Workspace Settings

| Setting Name | Purpose | Type | How to Generate | Admin Configurable |
|--------------|---------|------|-----------------|-------------------|
| `google_service_account` | Server-to-server auth | JSON | Download from Google Cloud Console | ✅ Yes |
| `google_calendar_id` | Default calendar for appointments | String | From Google Calendar settings | ✅ Yes |
| `google_drive_folder_id` | Document storage location | String | From Google Drive folder URL | ✅ Yes |

**Generation Instructions:**
1. **Service Account Key**:
   - Go to Google Cloud Console
   - Navigate to IAM & Admin → Service Accounts
   - Create service account or select existing
   - Generate JSON key file
   - Upload through admin dashboard

2. **Calendar ID**:
   - Open Google Calendar
   - Go to Settings → Calendar settings
   - Copy Calendar ID from integration section

#### Email Configuration

| Setting Name | Purpose | Type | How to Generate | Admin Configurable |
|--------------|---------|------|-----------------|-------------------|
| `smtp_host` | Email server hostname | String | From email provider | ✅ Yes |
| `smtp_port` | Email server port | Integer | Usually 587 or 465 | ✅ Yes |
| `smtp_username` | Email authentication | String | Email account username | ✅ Yes |
| `smtp_password` | Email authentication | String | App-specific password | ✅ Yes |
| `email_from_address` | Default sender email | Email | verified email address | ✅ Yes |

#### Analytics Configuration

| Setting Name | Purpose | Type | How to Generate | Admin Configurable |
|--------------|---------|------|-----------------|-------------------|
| `analytics_enabled` | Enable/disable tracking | Boolean | Toggle setting | ✅ Yes |
| `custom_events_enabled` | Track custom events | Boolean | Toggle setting | ✅ Yes |
| `conversion_tracking` | E-commerce tracking | Boolean | Toggle setting | ✅ Yes |

#### Payment Customization

| Setting Name | Purpose | Type | How to Generate | Admin Configurable |
|--------------|---------|------|-----------------|-------------------|
| `payment_methods_enabled` | Accepted payment types | Array | Select from options | ✅ Yes |
| `currency_settings` | Default currency | String | ISO currency code | ✅ Yes |
| `tax_configuration` | Tax calculation rules | Object | Configure tax rates | ✅ Yes |

## Security Best Practices

### Secret Management

1. **Rotation Schedule**:
   - JWT secrets: Every 90 days
   - API keys: Every 180 days
   - Webhook secrets: Every 30 days

2. **Access Control**:
   - Limit secret access to necessary personnel only
   - Use role-based permissions for admin dashboard
   - Enable two-factor authentication for all admin accounts

3. **Monitoring**:
   - Log all secret access attempts
   - Monitor API usage for unusual patterns
   - Set up alerts for failed authentication attempts

### Environment Separation

| Environment | Purpose | Secret Prefix | Domain |
|-------------|---------|---------------|---------|
| Development | Local development | `DEV_` | `localhost:5173` |
| Staging | Testing and QA | `STAGING_` | `staging.yourdomain.com` |
| Production | Live application | None | `yourdomain.com` |

### Backup and Recovery

1. **Secret Backup**:
   ```bash
   # Export current secrets (development only)
   wrangler secret list > secrets-backup.txt
   
   # Store backup in secure location (not in repository)
   ```

2. **Recovery Procedures**:
   - Document secret recovery process
   - Maintain offline backup of critical secrets
   - Test recovery procedures quarterly

## Validation and Testing

### Secret Validation Script

```bash
#!/bin/bash
# validate-secrets.sh

echo "Validating required secrets..."

# Check JWT secret length
if [[ ${#JWT_SECRET} -lt 32 ]]; then
  echo "❌ JWT_SECRET too short (minimum 32 characters)"
else
  echo "✅ JWT_SECRET length valid"
fi

# Check Square configuration
if [[ -z "$SQUARE_ACCESS_TOKEN" ]]; then
  echo "❌ SQUARE_ACCESS_TOKEN missing"
else
  echo "✅ SQUARE_ACCESS_TOKEN configured"
fi

# Test API connectivity
curl -f https://connect.squareup.com/v2/locations \
  -H "Authorization: Bearer $SQUARE_ACCESS_TOKEN" \
  -H "Square-Version: 2023-10-18" > /dev/null

if [[ $? -eq 0 ]]; then
  echo "✅ Square API connection successful"
else
  echo "❌ Square API connection failed"
fi

echo "Validation complete"
```

### Integration Testing

```bash
# Test Google API access
curl -f "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=$GOOGLE_ACCESS_TOKEN"

# Test Square webhook endpoint
curl -X POST https://your-domain.workers.dev/api/webhooks/square \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Test database connection
wrangler d1 execute puppy-database --command="SELECT 1"
```

## Troubleshooting

### Common Issues

1. **Invalid JWT Secrets**:
   - Symptom: Authentication failures
   - Solution: Regenerate JWT secret with proper length
   - Validation: Check secret is exactly 64 characters

2. **Square API Errors**:
   - Symptom: Payment processing failures
   - Solution: Verify access token and environment
   - Check: Ensure using production tokens for production

3. **Google API Quota Exceeded**:
   - Symptom: Google service errors
   - Solution: Check API quotas in Google Cloud Console
   - Upgrade: Increase quotas or implement caching

### Debug Commands

```bash
# Check worker logs
wrangler tail --env production

# Verify database connectivity
wrangler d1 execute puppy-database --command="SELECT COUNT(*) FROM users"

# Test API endpoints
curl -I https://your-domain.workers.dev/api/system/status
```

## Compliance and Auditing

### Regulatory Compliance

1. **PCI DSS** (Payment processing):
   - All payment data encrypted in transit and at rest
   - No storage of sensitive payment information
   - Regular security audits required

2. **GDPR** (Data protection):
   - Customer data encryption
   - Right to be forgotten implementation
   - Data processing consent tracking

3. **SOC 2** (Security controls):
   - Access logging and monitoring
   - Incident response procedures
   - Regular penetration testing

### Audit Trail

- All secret access logged with timestamps
- Admin dashboard actions tracked
- Payment transactions recorded
- Data deletion requests documented
- Security incident reports maintained

This documentation should be reviewed quarterly and updated as new integrations are added or security requirements change.
