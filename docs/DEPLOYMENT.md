
# Puppy Breeder App Deployment Guide

This guide explains how to deploy the Puppy Breeder App using Cloudflare Workers.

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

## Deploy the Workers-Only Application

### Step 1: Configure Secrets

```bash
wrangler secret put JWT_SECRET
wrangler secret put SQUARE_ACCESS_TOKEN
wrangler secret put SENDGRID_API_KEY
wrangler secret put INTERNAL_WEBHOOK_SECRET
wrangler secret put STRIPE_SECRET_KEY
```

### Step 2: Build the frontend

```bash
npm run build
```

### Step 3: Deploy the Worker

```bash
# Deploy the worker
wrangler deploy
```

### Step 4: Set up a Custom Domain

In the Cloudflare Dashboard:

1. Go to Workers & Pages
2. Select your worker
3. Click on "Add Custom Domain"
4. Enter your domain (e.g., `new.gdspuppies.com`) and follow the instructions

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
