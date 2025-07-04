# Square OAuth Setup Guide

This guide provides complete step-by-step instructions for setting up Square OAuth integration with your Puppy Breeder App.

## Overview

Square OAuth allows your application to:
- ✅ Securely connect to merchant Square accounts
- ✅ Process payments on behalf of merchants
- ✅ Access Square APIs with proper permissions
- ✅ Sync inventory, sales, and customer data
- ✅ Receive real-time webhook notifications

## Required URLs for Square Application Setup

### 🔗 OAuth Redirect URL
```
https://new.gdspuppies.com/square/oauth/callback
```

### 🔗 Webhook Notification URL
```
https://new.gdspuppies.com/api/webhooks/square/payment
```

### 🔗 Application URL
```
https://new.gdspuppies.com
```

## Step 1: Create Square Developer Account

1. **Visit Square Developer Portal**
   - Go to [https://developer.squareup.com/](https://developer.squareup.com/)
   - Click **"Sign Up"** or **"Sign In"** if you have an account

2. **Create New Application**
   - Click **"Create Application"**
   - Enter application name: **"GDS Puppies Breeder App"**
   - Select application type: **"Web App"**
   - Click **"Create Application"**

## Step 2: Configure OAuth Settings

1. **Navigate to OAuth Settings**
   - In your application dashboard, click **"OAuth"** in the left sidebar

2. **Add Redirect URL**
   - Click **"Add Redirect URL"**
   - Enter: `https://new.gdspuppies.com/square/oauth/callback`
   - Click **"Save"**

3. **Configure Permissions**
   Select the following OAuth scopes:
   - ✅ `MERCHANT_PROFILE_READ` - Read merchant profile
   - ✅ `PAYMENTS_READ` - Read payment information
   - ✅ `PAYMENTS_WRITE` - Process payments
   - ✅ `ORDERS_READ` - Read order information
   - ✅ `ORDERS_WRITE` - Create and manage orders
   - ✅ `CUSTOMERS_READ` - Read customer information
   - ✅ `CUSTOMERS_WRITE` - Create and manage customers
   - ✅ `INVENTORY_READ` - Read inventory information
   - ✅ `INVENTORY_WRITE` - Manage inventory

## Step 3: Get Application Credentials

1. **Get Application ID**
   - Copy the **Application ID** from the **"Credentials"** section
   - This will be your `SQUARE_APPLICATION_ID`

2. **Get Application Secret**
   - Copy the **Application Secret** from the **"Credentials"** section  
   - This will be your `SQUARE_APPLICATION_SECRET`

3. **Get Access Tokens (for testing)**
   - **Sandbox Access Token**: For development/testing
   - **Production Access Token**: For live transactions

## Step 4: Configure Webhooks

1. **Navigate to Webhooks**
   - Click **"Webhooks"** in the left sidebar

2. **Create Webhook Endpoint**
   - Click **"Create Webhook"**
   - **Notification URL**: `https://new.gdspuppies.com/api/webhooks/square/payment`
   - **API Version**: `2024-06-04` (latest)

3. **Select Event Types**
   Subscribe to these events:
   - ✅ `payment.created`
   - ✅ `payment.updated` 
   - ✅ `refund.created`
   - ✅ `refund.updated`
   - ✅ `order.created`
   - ✅ `order.updated`

4. **Get Webhook Signature Key**
   - Copy the **Signature Key** after creating the webhook
   - This will be your `SQUARE_WEBHOOK_SIGNATURE_KEY`

## Step 5: Set Cloudflare Worker Secrets

Use the `wrangler` CLI to set the required secrets:

```bash
# Application credentials
wrangler secret put SQUARE_APPLICATION_ID
# Enter your Square Application ID when prompted

wrangler secret put SQUARE_APPLICATION_SECRET  
# Enter your Square Application Secret when prompted

# Access tokens
wrangler secret put SQUARE_ACCESS_TOKEN
# Enter your Production Access Token when prompted

wrangler secret put SQUARE_SANDBOX_ACCESS_TOKEN
# Enter your Sandbox Access Token when prompted

# Webhook signature
wrangler secret put SQUARE_WEBHOOK_SIGNATURE_KEY
# Enter your Webhook Signature Key when prompted

# Optional: Location IDs if you have specific locations
wrangler secret put SQUARE_LOCATION_ID
# Enter your Production Location ID when prompted

wrangler secret put SQUARE_SANDBOX_LOCATION_ID  
# Enter your Sandbox Location ID when prompted
```

## Step 6: Deploy and Test

1. **Deploy to Cloudflare Workers**
   ```bash
   npm run build
   wrangler deploy
   ```

2. **Test OAuth Flow**
   - Go to your admin dashboard: `https://new.gdspuppies.com/admin`
   - Navigate to **Square Integration** tab
   - Click **"Connect Square Account"**
   - Complete the OAuth authorization
   - Verify connection shows as "Connected"

## Step 7: Test Webhook Delivery

1. **View Webhook Logs**
   - In Square Developer Dashboard, go to **Webhooks**
   - Click on your webhook endpoint
   - Check **"Event Log"** for delivery status

2. **Test Payment Flow**
   - Create a test payment in Square Sandbox
   - Verify webhook is received at your endpoint
   - Check Cloudflare Worker logs for processing

## Important Security Notes

🔐 **Never expose sensitive credentials:**
- Application Secret must be stored as Cloudflare Worker secret
- Access tokens must be stored as Cloudflare Worker secrets
- Webhook signature key must be stored as Cloudflare Worker secret

🔐 **Use HTTPS only:**
- All OAuth redirect URLs must use HTTPS
- All webhook URLs must use HTTPS
- Local development can use HTTP with localhost only

🔐 **Validate webhook signatures:**
- Always verify webhook signatures in production
- Reject requests with invalid signatures
- Use the provided signature key for verification

## Environment Differences

### Sandbox Environment
- Use for development and testing
- Use Sandbox Access Token
- All payments are simulated
- Safe for testing without real money

### Production Environment  
- Use for live transactions
- Use Production Access Token
- Real payments and money transfers
- Requires careful testing before deployment

## Troubleshooting

### Common Issues

**OAuth Redirect Error**
- Verify redirect URL exactly matches Square configuration
- Ensure HTTPS is used (not HTTP)
- Check for typos in domain name

**Webhook Not Received**
- Verify webhook URL is publicly accessible
- Check Cloudflare Worker logs for errors
- Ensure webhook endpoint returns 200 status

**Permission Denied**
- Verify OAuth scopes are configured correctly
- Check that merchant granted required permissions
- Re-authorize if permissions changed

**Token Expired**
- Square access tokens expire after 30 days
- Use refresh token to get new access token
- Implement automatic token refresh logic

### Testing Resources

**Square Sandbox**
- Dashboard: [https://developer.squareup.com/apps](https://developer.squareup.com/apps)
- Test Card Numbers: Use Square's test card numbers for payments
- API Explorer: Test API calls directly from browser

**Webhook Testing**
- Use tools like ngrok for local development
- Check webhook event logs in Square Dashboard
- Verify webhook signature validation

## Support

If you encounter issues:

1. **Check Square Documentation**: [https://developer.squareup.com/docs](https://developer.squareup.com/docs)
2. **Square Developer Community**: [https://developer.squareup.com/forums](https://developer.squareup.com/forums)
3. **Contact Square Support**: Through Developer Dashboard

## Implementation Status

✅ OAuth authorization flow  
✅ Token exchange and storage  
✅ Webhook endpoint setup  
✅ Admin UI for connection management  
✅ Error handling and security  
✅ Production-ready deployment  

Your Square OAuth integration is now ready for production use!