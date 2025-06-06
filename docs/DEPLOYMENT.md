# GDS Puppies Application Deployment Guide

This guide explains how to deploy the GDS Puppies application, which includes a React frontend and a Cloudflare Worker backend.

## 1. Prerequisites

*   A Cloudflare account.
*   [Node.js](https://nodejs.org/) (version 20.0.0 or higher recommended for Wrangler compatibility).
*   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (Cloudflare's command-line tool for Workers). It's recommended to install it as a dev dependency or use `npx wrangler`.
    ```bash
    # To install globally (optional, npx is preferred for project-local versions)
    # npm install -g wrangler
    # or
    # bun install -g wrangler
    ```
*   [Bun](https://bun.sh/) (recommended for package management and running scripts as used in this project) or npm/yarn.

## 2. Initial Cloudflare Resource Setup

These steps are typically done once when setting up the project environment.

### Step 2.1: Login to Cloudflare
Authenticate Wrangler with your Cloudflare account:
```bash
npx wrangler login
```

### Step 2.2: Configure D1 Database (`PUPPIES_DB`)
Create the D1 database if it doesn't exist:
```bash
npx wrangler d1 create puppy_breeder_db
```
This command will return a `database_id`. Update your `wrangler.toml` with the `database_name` ("puppy_breeder_db") and the `database_id`.

### Step 2.3: Configure KV Namespaces
Create the necessary KV namespaces if they don't exist:
*   **`AUTH_STORE`**: For session data, authentication tokens, etc.
    ```bash
    npx wrangler kv:namespace create AUTH_STORE
    npx wrangler kv:namespace create AUTH_STORE --preview
    ```
*   **`STATIC_CONTENT`**: For serving static assets (if configured for this, though Vite usually handles frontend assets).
    ```bash
    npx wrangler kv:namespace create STATIC_CONTENT
    npx wrangler kv:namespace create STATIC_CONTENT --preview
    ```
Update `wrangler.toml` with the `id` and `preview_id` for each namespace.

### Step 2.4: (Optional) Configure R2 Bucket (`PUPPY_IMAGES`)
If using R2 for image storage:
```bash
npx wrangler r2 bucket create puppy-breeder-images # For production
npx wrangler r2 bucket create puppy-breeder-images-dev # For preview/development
```
Update `wrangler.toml` with the bucket names.

## 3. Environment Variables and Secrets

The Cloudflare Worker requires several environment variables and secrets to be configured. Secrets should be set using `npx wrangler secret put <SECRET_NAME>`. Variables can be set in `wrangler.toml` under `[vars]` or also as secrets if sensitive.

*   **Bindings (configured in `wrangler.toml`)**:
    *   `PUPPIES_DB`: D1 Database binding.
    *   `AUTH_STORE`: KV Namespace binding for authentication data.
    *   `STATIC_CONTENT`: KV Namespace binding for static content.
    *   `PUPPY_IMAGES`: R2 Bucket binding for puppy images.
*   **Secrets (set via `npx wrangler secret put ...`)**:
    *   `JWT_SECRET`: A strong, random string used for signing and verifying JSON Web Tokens.
        ```bash
        # Generate a strong secret and then set it
        npx wrangler secret put JWT_SECRET
        ```
    *   `ENCRYPTION_KEY_SECRET`: A 64-character hex string (representing 32 bytes) used for AES-256-GCM encryption of sensitive data like API keys stored in the `third_party_integrations` table.
        ```bash
        # Generate a 32-byte hex key (e.g., using openssl rand -hex 32) and then set it
        npx wrangler secret put ENCRYPTION_KEY_SECRET
        ```
    *   `SQUARE_ACCESS_TOKEN`: Your Square application's access token (use Sandbox token for development/testing).
        ```bash
        npx wrangler secret put SQUARE_ACCESS_TOKEN
        ```
    *   `SQUARE_WEBHOOK_SIGNATURE_KEY`: The signature key for verifying incoming Square webhooks. Get this from your Square Developer Dashboard.
        ```bash
        npx wrangler secret put SQUARE_WEBHOOK_SIGNATURE_KEY
        ```
*   **Variables (can be in `wrangler.toml` or as secrets)**:
    *   `ENVIRONMENT_NAME`: Specifies the environment (e.g., "development", "production"). Used by Square client and potentially other services.
        ```toml
        # In wrangler.toml
        [vars]
        ENVIRONMENT_NAME = "development"
        ```
        Or as a secret if preferred: `npx wrangler secret put ENVIRONMENT_NAME`

*   **Service-Specific API Keys (Managed via Admin Panel)**:
    *   API keys for services like SendGrid (for emails) or Tawk.to (for live chat) are intended to be configured via the application's admin panel (`Third-Party Integrations` section). They are stored encrypted in the `third_party_integrations` table in the D1 database, using the `ENCRYPTION_KEY_SECRET`. Avoid setting these as individual environment secrets if using the admin panel feature.

## 4. Build and Deployment Steps

### Step 4.1: Install Dependencies
Install project dependencies:
```bash
bun install
# or npm install
```

### Step 4.2: Build Frontend Assets
Build the React frontend application:
```bash
bun run build
# or npm run build
```
This command (typically `vite build`) compiles the frontend assets into the `dist` directory.

### Step 4.3: Database Schema and Seed (Initial Setup / Updates)
Apply the database schema and initial seed data. This is crucial for the first deployment and for subsequent schema changes.
*   **Schema**:
    ```bash
    # For local development (if using wrangler dev --local --persist)
    npx wrangler d1 execute puppy_breeder_db --file src/worker/schema.sql --local

    # For production/preview environment
    npx wrangler d1 execute puppy_breeder_db --file src/worker/schema.sql --remote
    ```
*   **Seed Data** (includes default email templates, etc.):
    ```bash
    # For local development
    npx wrangler d1 execute puppy_breeder_db --file src/worker/seed.sql --local

    # For production/preview environment
    npx wrangler d1 execute puppy_breeder_db --file src/worker/seed.sql --remote
    ```
    **Note**: Migration scripts for subsequent schema changes should be applied similarly.

### Step 4.4: Deploy the Cloudflare Worker
Deploy the worker (which includes the backend logic and serves the frontend assets):
```bash
npx wrangler deploy src/worker/index.ts
# Or, if your wrangler.toml `main` field is correctly set:
# npx wrangler deploy
```
The `main` field in `wrangler.toml` (e.g., `main = "src/worker/index.ts"`) specifies the entry point for your worker.

## 5. `wrangler.toml` Configuration Highlights

Ensure your `wrangler.toml` file is correctly configured. Key sections include:
*   `name`: Your worker's name.
*   `main`: Entry point for your worker (e.g., `src/worker/index.ts`).
*   `compatibility_date`: Sets the compatibility mode for the Worker.
*   `vars`: For non-secret environment variables.
*   `kv_namespaces`: Bindings for `AUTH_STORE`, `STATIC_CONTENT`.
*   `d1_databases`: Binding for `PUPPIES_DB`.
*   `r2_buckets`: Binding for `PUPPY_IMAGES`.
*   `[durable_objects]`: Bindings for any Durable Objects used (e.g., `SESSIONS`).
*   `[site]`: Configuration for serving static assets, if using Wrangler for this (e.g., `bucket = "./dist"`). If Vite builds to `dist`, this tells Wrangler where to find frontend assets.

## 6. Progressive Web App (PWA) Notes

*   **Manifest & Service Worker**: The application includes `public/manifest.json` and `public/sw.js` to provide basic PWA capabilities (installability, app shell caching).
*   **Icons**: Placeholder icon paths are defined in `manifest.json` (e.g., `/icons/icon-192x192.png`). Actual icon image files need to be created and placed in the `public/icons/` directory.
*   **Asset Caching**: The current `sw.js` uses placeholder names for JavaScript and CSS bundles in its precache list (e.g., `/assets/index.js`). For robust PWA caching of versioned/hashed assets generated by Vite, integration with a build tool like `vite-plugin-pwa` or Workbox CLI is recommended. These tools can generate a service worker or precache manifest with the correct hashed asset names during the build process.

## 7. Custom Domain

After deployment, you can set up a custom domain for your application via the Cloudflare Dashboard:
1.  Navigate to "Workers & Pages".
2.  Select your deployed worker/application.
3.  Go to the "Triggers" tab and add your custom domain or route.

## 8. Ongoing Maintenance & Updates

*   **Schema Migrations**: For database schema changes after the initial setup, create new SQL migration files and apply them using `wrangler d1 execute ... --file=./migrations/your_migration_file.sql`.
*   **Updating Dependencies**: Regularly update project dependencies (`bun update` or `npm update`) and test thoroughly.
*   **Monitoring**: Use Cloudflare's dashboard to monitor Worker invocations, D1 database usage, KV operations, and R2 storage.
*   **Backups**:
    *   **D1 Database**: Use `wrangler d1 export <DATABASE_NAME> --output ./backup.sql` for backups.
    *   **KV Data**: Can be backed up programmatically using the Cloudflare API or third-party tools.
    *   **R2 Data**: Implement a backup strategy for your R2 buckets if necessary.

This guide provides a comprehensive overview of deploying and managing the GDS Puppies application. Always refer to the latest Cloudflare and Wrangler documentation for specific commands and best practices.
