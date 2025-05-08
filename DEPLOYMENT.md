
# Puppy Breeder App Deployment Guide

This guide explains how to deploy the Puppy Breeder App using Cloudflare Workers and Pages.

## Prerequisites

1. A Cloudflare account
2. [Node.js](https://nodejs.org/) (version 16+)
3. [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

```bash
npm install -g wrangler
```

## Setup Cloudflare Resources

### Step 1: Login to Cloudflare

```bash
wrangler login
```

### Step 2: Set up KV namespace

```bash
# Create KV namespace for authentication
wrangler kv:namespace create "puppy_breeder_AUTH_STORE"
wrangler kv:namespace create "puppy_breeder_AUTH_STORE" --preview
```

Take note of the IDs returned and update them in wrangler.toml.

### Step 3: Set up D1 database

```bash
# Create D1 database
wrangler d1 create puppy_breeder_db
```

Take note of the database ID returned and update it in wrangler.toml.

### Step 4: Create R2 bucket for image storage

```bash
# Create R2 bucket for images
wrangler r2 bucket create puppy_breeder_images
wrangler r2 bucket create puppy_breeder_images_dev
```

### Step 5: Initialize the database

Create a file named `schema.sql` with the database schema (already provided in src/worker/schema.sql).

```bash
# Apply the schema to the database
wrangler d1 execute puppy_breeder_db --file=./src/worker/schema.sql
```

## Deploy the Application

### Step 1: Deploy the Worker

```bash
# Deploy the worker
wrangler deploy
```

### Step 2: Deploy the frontend to Pages

First, build your frontend:

```bash
npm run build
```

Then deploy to Cloudflare Pages:

```bash
# Deploy to Pages
wrangler pages deploy dist
```

### Step 3: Connect Pages to your Worker

In the Cloudflare Dashboard:

1. Go to Pages
2. Select your project
3. Go to Settings > Functions
4. Connect your worker to the Pages project

## Environment Variables

Make sure to set up these environment variables in your Cloudflare Pages project:

1. `VITE_API_URL` - The URL to your Workers API (leave empty if using the same domain)

## Custom Domain (Optional)

To set up a custom domain:

1. Go to the Pages project in the Cloudflare Dashboard
2. Navigate to Custom domains
3. Add your domain and follow the instructions

## Ongoing Maintenance

### Updating the Database Schema

When you need to update the database schema:

```bash
# Apply schema changes
wrangler d1 execute puppy_breeder_db --file=./migrations/[update-file].sql
```

### Monitoring

Use Cloudflare's built-in analytics to monitor your application:

1. Worker invocations and errors
2. D1 database queries
3. R2 storage usage

## Backup Procedures

### Backing up the D1 Database

```bash
# Export the database
wrangler d1 export puppy_breeder_db
```

### Backing up KV Data

```bash
# Export KV data (using Cloudflare API)
curl -X GET "https://api.cloudflare.com/client/v4/accounts/{account_id}/storage/kv/namespaces/{namespace_id}/values" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json"
```

### Backing up R2 Data

Use the Cloudflare R2 API to regularly back up important images.

## Security Considerations

1. Always use HTTPS
2. Implement rate limiting for API endpoints
3. Use Cloudflare Web Application Firewall (WAF) to protect your application
4. Regularly rotate API tokens and secrets
5. Enable Cloudflare Access for admin routes if necessary

## Troubleshooting

Common issues and their solutions:

1. Worker deployment failures: Check logs with `wrangler tail`
2. Database connection issues: Verify database binding in wrangler.toml
3. CORS errors: Check the CORS headers in your Worker code

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
