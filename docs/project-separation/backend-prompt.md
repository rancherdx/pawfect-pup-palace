
# Backend Project Prompt - Puppy Breeder API (Cloudflare Workers)

## Project Overview
Create a comprehensive backend API for a puppy breeder business using Cloudflare Workers, D1 Database, KV Storage, and R2 Bucket. This will serve as the complete backend for a puppy breeding operation with advanced features.

## Technology Stack
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (for images/files)
- **Cache/Session**: Cloudflare KV
- **Routing**: itty-router
- **Authentication**: JWT with bcrypt password hashing

## Required Cloudflare Resources

### 1. D1 Database
```bash
wrangler d1 create puppy_breeder_db
```

### 2. KV Namespaces
```bash
wrangler kv:namespace create "AUTH_STORE"
wrangler kv:namespace create "AUTH_STORE" --preview
```

### 3. R2 Buckets
```bash
wrangler r2 bucket create puppy-images
wrangler r2 bucket create puppy-images-dev
```

### 4. Durable Objects
- Sessions management for real-time features

## Environment Variables & Secrets

### Required Secrets
```bash
wrangler secret put JWT_SECRET
wrangler secret put SQUARE_ACCESS_TOKEN
wrangler secret put SENDGRID_API_KEY
wrangler secret put INTERNAL_WEBHOOK_SECRET
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put AFFILIATE_TRACKING_SECRET
wrangler secret put SEO_API_KEY
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put GOOGLE_SERVICE_ACCOUNT_KEY
wrangler secret put GOOGLE_WORKSPACE_DOMAIN
wrangler secret put GOOGLE_WORKSPACE_ADMIN_EMAIL
```

### Environment Variables
```typescript
export interface Env {
  AUTH_STORE: KVNamespace;
  PUPPIES_DB: D1Database;
  PUPPY_IMAGES: R2Bucket;
  SESSIONS: DurableObjectNamespace;
  ENV: string;
  JWT_SECRET: string;
  SQUARE_ACCESS_TOKEN: string;
  SENDGRID_API_KEY: string;
  INTERNAL_WEBHOOK_SECRET: string;
  STRIPE_SECRET_KEY: string;
  AFFILIATE_TRACKING_SECRET: string;
  SEO_API_KEY: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_SERVICE_ACCOUNT_KEY: string;
  GOOGLE_WORKSPACE_DOMAIN: string;
  GOOGLE_WORKSPACE_ADMIN_EMAIL: string;
}
```

## Database Schema

### Core Tables
```sql
-- Users table with role-based access
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  roles TEXT NOT NULL DEFAULT '["user"]',
  google_id TEXT,
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_token_expires_at INTEGER,
  profile_picture TEXT,
  calendar_sync_enabled BOOLEAN DEFAULT FALSE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_login INTEGER,
  force_password_change BOOLEAN DEFAULT 0
);

-- Parent dogs (breeding stock)
CREATE TABLE parent_dogs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  gender TEXT NOT NULL,
  color TEXT NOT NULL,
  is_stud BOOLEAN DEFAULT 0,
  stud_fee REAL,
  certifications TEXT,
  image_url TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Litters
CREATE TABLE litters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  breed TEXT NOT NULL,
  mom_id TEXT,
  dad_id TEXT,
  description TEXT,
  image_url TEXT,
  expected_availability_date TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (mom_id) REFERENCES parent_dogs(id),
  FOREIGN KEY (dad_id) REFERENCES parent_dogs(id)
);

-- Puppies
CREATE TABLE puppies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  gender TEXT NOT NULL,
  color TEXT NOT NULL,
  price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Available',
  litter_id TEXT,
  mom_id TEXT,
  dad_id TEXT,
  description TEXT,
  traits TEXT,
  health_records TEXT,
  image_url TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (litter_id) REFERENCES litters(id),
  FOREIGN KEY (mom_id) REFERENCES parent_dogs(id),
  FOREIGN KEY (dad_id) REFERENCES parent_dogs(id)
);

-- Blog posts
CREATE TABLE blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  image TEXT,
  category TEXT,
  published_at TEXT,
  author TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  related_posts TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Blog categories
CREATE TABLE blog_categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Affiliate partners
CREATE TABLE affiliate_partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  commission TEXT NOT NULL,
  visits INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  total_sales TEXT DEFAULT '0',
  active BOOLEAN DEFAULT TRUE,
  date_created TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Promo codes
CREATE TABLE promo_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount TEXT NOT NULL,
  uses INTEGER DEFAULT 0,
  max_uses INTEGER,
  start_date TEXT NOT NULL,
  end_date TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Calendar events (Google Calendar integration)
CREATE TABLE calendar_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  google_event_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Payments/Orders
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  puppy_id TEXT,
  amount REAL NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  stripe_session_id TEXT,
  square_payment_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (puppy_id) REFERENCES puppies(id)
);
```

## API Endpoints Structure

### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/user
POST /api/auth/google/callback
```

### Google Integration Endpoints
```
GET  /api/auth/google/url
POST /api/auth/google/callback
GET  /api/calendar/events
POST /api/calendar/events
PUT  /api/calendar/events/:id
DELETE /api/calendar/events/:id
POST /api/email/send
```

### Puppy Management Endpoints
```
GET    /api/puppies
GET    /api/puppies/:id
POST   /api/puppies          (Admin only)
PUT    /api/puppies/:id      (Admin only)
DELETE /api/puppies/:id      (Admin only)
POST   /api/puppies/:id/images
```

### Litter Management Endpoints
```
GET    /api/litters
GET    /api/litters/:id
POST   /api/litters          (Admin only)
PUT    /api/litters/:id      (Admin only)
DELETE /api/litters/:id      (Admin only)
```

### Blog Management Endpoints
```
GET    /api/blog/posts
GET    /api/blog/posts/:slug
POST   /api/blog/posts       (Admin only)
PUT    /api/blog/posts/:id   (Admin only)
DELETE /api/blog/posts/:id   (Admin only)
GET    /api/blog/categories
POST   /api/blog/categories  (Admin only)
```

### Affiliate & Marketing Endpoints
```
GET    /api/affiliates
POST   /api/affiliates       (Admin only)
PUT    /api/affiliates/:id   (Admin only)
DELETE /api/affiliates/:id   (Admin only)
GET    /api/promo-codes
POST   /api/promo-codes      (Admin only)
PUT    /api/promo-codes/:id  (Admin only)
DELETE /api/promo-codes/:id  (Admin only)
```

### Payment Endpoints
```
POST /api/payments/square
POST /api/payments/stripe
POST /api/payments/webhook
GET  /api/payments/history   (User's own payments)
```

### System & Admin Endpoints
```
GET /api/status
GET /api/init-db
GET /api/test/database       (Admin only)
GET /api/test/kv             (Admin only)
GET /api/admin/analytics     (Admin only)
```

## Key Features Implementation

### 1. Authentication System
- JWT-based authentication with refresh tokens
- Role-based access control (user, admin, super-admin)
- Google OAuth integration
- Password hashing with bcrypt
- Session management in KV store

### 2. Google Integration
- OAuth 2.0 authentication flow
- Google Calendar synchronization
- Gmail API for transactional emails
- Google Workspace integration

### 3. File Upload & Management
- R2 bucket integration for image storage
- Image optimization and resizing
- Secure file upload endpoints
- CDN delivery for images

### 4. Payment Processing
- Square API integration
- Stripe integration as backup
- Webhook handling for payment confirmations
- Transaction history and reporting

### 5. Blog & Content Management
- Full CRUD for blog posts
- Category management
- SEO-friendly slugs
- Content scheduling

### 6. Affiliate & Marketing
- Affiliate partner management
- Promo code system
- Commission tracking
- Marketing analytics

### 7. Search & Analytics
- Global search functionality
- SEO optimization
- Performance analytics
- System monitoring

## Security Implementation

### Authentication Middleware
```typescript
export async function verifyAuth(request: Request, env: Env) {
  // JWT verification with role checking
  // Session validation against KV store
  // Rate limiting implementation
}
```

### CORS Configuration
```typescript
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
```

### Input Validation
- Zod schema validation for all inputs
- SQL injection prevention
- XSS protection
- Rate limiting on all endpoints

## Deployment Configuration

### wrangler.toml
```toml
name = "puppy-breeder-api"
main = "src/worker/index.ts"
compatibility_date = "2024-12-01"

[[d1_databases]]
binding = "PUPPIES_DB"
database_name = "puppy_breeder_db"
database_id = "your-database-id"

[[kv_namespaces]]
binding = "AUTH_STORE"
id = "your-kv-id"

[[r2_buckets]]
binding = "PUPPY_IMAGES"
bucket_name = "puppy-images"

[durable_objects]
bindings = [
  { name = "SESSIONS", class_name = "SessionDO" }
]
```

## Error Handling & Logging
- Comprehensive error handling for all endpoints
- Structured logging for debugging
- Performance monitoring
- Health check endpoints

## Testing Strategy
- Unit tests for all controllers
- Integration tests for API endpoints
- Mock implementations for external services
- Load testing for performance validation

## Documentation Requirements
- Complete API documentation with examples
- Authentication flow diagrams
- Database relationship diagrams
- Deployment guides
- Troubleshooting documentation

## Performance Optimization
- Database query optimization
- Caching strategies using KV
- Image optimization pipelines
- CDN configuration for static assets

This backend should provide a complete, production-ready API for the puppy breeder application with all the advanced features needed for a professional breeding operation.
