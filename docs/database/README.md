# Database Architecture and Setup

This document outlines the database structure and setup process for the Puppy Breeder App.

## Database Technology

The application uses Cloudflare D1, a serverless SQL database that integrates seamlessly with Cloudflare Workers.

## Schema Design

The complete database schema is defined in `src/worker/schema.sql`. Below is the current version of the schema:

```sql
-- Base tables for puppies and litters
CREATE TABLE IF NOT EXISTS breeds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  temperament TEXT,
  size TEXT,
  lifespan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS litters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  breed_id TEXT REFERENCES breeds(id),
  dam_name TEXT NOT NULL,
  sire_name TEXT NOT NULL,
  born_date DATE,
  available_date DATE,
  description TEXT,
  price REAL,
  status TEXT DEFAULT 'upcoming', -- upcoming, available, sold
  image_urls TEXT, -- JSON array of image URLs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS puppies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  litter_id TEXT REFERENCES litters(id),
  gender TEXT NOT NULL,
  color TEXT,
  birth_date DATE,
  weight REAL, -- in pounds
  price REAL,
  status TEXT DEFAULT 'available', -- available, reserved, adopted
  microchip_id TEXT,
  description TEXT,
  temperament_notes TEXT,
  health_notes TEXT,
  image_urls TEXT, -- JSON array of image URLs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NOT NULL, -- hashed password
  roles TEXT DEFAULT '["user"]', -- JSON array of roles
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS adoptions (
  id TEXT PRIMARY KEY,
  puppy_id TEXT REFERENCES puppies(id),
  user_id TEXT REFERENCES users(id),
  adoption_date DATE,
  price REAL,
  payment_status TEXT,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Additional tables for marketing and blog functionality
CREATE TABLE IF NOT EXISTS blog_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  author TEXT,
  category_id TEXT REFERENCES blog_categories(id),
  status TEXT DEFAULT 'draft', -- draft, published
  published_at TIMESTAMP,
  featured_image TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_related_posts (
  post_id TEXT REFERENCES blog_posts(id),
  related_post_id TEXT REFERENCES blog_posts(id),
  PRIMARY KEY (post_id, related_post_id)
);

CREATE TABLE IF NOT EXISTS affiliates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  commission REAL DEFAULT 10.0, -- percentage
  total_visits INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_sales REAL DEFAULT 0.0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promo_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- percentage, fixed
  discount_amount REAL NOT NULL,
  uses INTEGER DEFAULT 0,
  max_uses INTEGER, -- NULL for unlimited
  start_date DATE NOT NULL,
  end_date DATE, -- NULL for no expiration
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seo_metadata (
  page_path TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  keywords TEXT,
  og_image TEXT,
  score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_puppies_litter_id ON puppies(litter_id);
CREATE INDEX IF NOT EXISTS idx_puppies_status ON puppies(status);
CREATE INDEX IF NOT EXISTS idx_litters_breed_id ON litters(breed_id);
CREATE INDEX IF NOT EXISTS idx_litters_status ON litters(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);

-- Transactions table for Square payments
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  puppy_id TEXT,
  square_payment_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  payment_method_details TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (puppy_id) REFERENCES puppies(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_square_payment_id ON transactions(square_payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_puppy_id ON transactions(puppy_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  is_editable_in_admin BOOLEAN NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates(name);

-- Third-party integrations table
CREATE TABLE IF NOT EXISTS third_party_integrations (
  id TEXT PRIMARY KEY,
  service_name TEXT UNIQUE NOT NULL,
  api_key TEXT, -- Will be stored encrypted by the application
  other_config TEXT, -- JSON for additional settings
  is_active BOOLEAN NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_third_party_integrations_service_name ON third_party_integrations(service_name);
CREATE INDEX IF NOT EXISTS idx_third_party_integrations_is_active ON third_party_integrations(is_active);

-- Stud Dogs table
CREATE TABLE IF NOT EXISTS stud_dogs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  breed_id TEXT,
  age INTEGER, -- Consider using date_of_birth TEXT for more precision
  description TEXT,
  temperament TEXT,
  certifications TEXT, -- JSON array of strings, e.g., ["CH", "OFA Good"]
  stud_fee REAL NOT NULL,
  image_urls TEXT, -- JSON array of strings
  is_available BOOLEAN DEFAULT 1,
  owner_user_id TEXT, -- User who listed the stud, likely an admin or breeder role
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (breed_id) REFERENCES breeds(id) ON DELETE SET NULL,
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_stud_dogs_breed_id ON stud_dogs(breed_id);
CREATE INDEX IF NOT EXISTS idx_stud_dogs_is_available ON stud_dogs(is_available);
CREATE INDEX IF NOT EXISTS idx_stud_dogs_owner_user_id ON stud_dogs(owner_user_id);
```

The schema includes tables for managing breeds, litters, puppies, users (with roles), adoptions, blog content (categories, posts, related posts), marketing tools (affiliates, promo codes), SEO metadata, financial transactions, email templates, third-party service integrations (with encrypted API keys), and stud dog listings.

All tables use `IF NOT EXISTS` to allow for idempotent schema application. Indexes are created on frequently queried columns and foreign key relationships to optimize performance. Timestamps for creation and updates are generally included.

## Setup and Initialization

### Creating the D1 Database

If not already done, create the D1 database using Wrangler:
```bash
wrangler d1 create puppy_breeder_db
```

Then, add or verify the D1 binding in your `wrangler.toml` file:
```toml
[[d1_databases]]
binding = "PUPPIES_DB" # This is how your Worker will access the database
database_name = "puppy_breeder_db" # The name you gave your D1 database
database_id = "your-unique-database-id" # Provided by `wrangler d1 create`
```

### Initializing the Schema

To apply the schema to your D1 database (locally for development or against your deployed database):
```bash
# For local development (ensure you have run `npx wrangler dev --local` previously to set up local D1)
npx wrangler d1 execute puppy_breeder_db --file=./src/worker/schema.sql --local

# For production/preview (ensure correct environment for wrangler is targeted)
# npx wrangler d1 execute puppy_breeder_db --file=./src/worker/schema.sql --remote
```

### Seeding Initial Data

To populate the database with initial data (breeds, admin users, etc.), use the seed script:
```bash
# For local development
npx wrangler d1 execute puppy_breeder_db --file=./src/worker/seed.sql --local

# For production/preview
# npx wrangler d1 execute puppy_breeder_db --file=./src/worker/seed.sql --remote
```

## Database API Usage in Worker

The Cloudflare Worker interacts with the D1 database using prepared statements. Here are conceptual examples:

### Fetching Data
```typescript
// Example: Fetching a puppy by ID from a controller
// const { results } = await env.PUPPIES_DB.prepare(
//   'SELECT * FROM puppies WHERE id = ?'
// ).bind(puppyId).all();
// const puppy = results.length ? results[0] : null;
```

### Inserting Data
```typescript
// Example: Creating a new user from a controller
// const userId = crypto.randomUUID();
// const now = new Date().toISOString();
// await env.PUPPIES_DB.prepare(
//   'INSERT INTO users (id, email, name, password, roles, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
// ).bind(userId, email, hashedPassword, name, JSON.stringify(['user']), now, now).run();
```

### Transactions (Batch Operations)

D1 supports batching multiple statements, which are executed transactionally.
```typescript
// Example:
// const statements = [
//   env.PUPPIES_DB.prepare("INSERT INTO ...").bind(...),
//   env.PUPPIES_DB.prepare("UPDATE ... WHERE ...").bind(...)
// ];
// const results = await env.PUPPIES_DB.batch(statements);
```

## Database Migrations

For future schema updates beyond the initial setup, it's recommended to create incremental migration scripts (e.g., `migrations/001_add_new_feature_table.sql`) and apply them sequentially using `wrangler d1 execute`. This helps manage schema evolution over time.

## Backup and Restore

Cloudflare D1 provides tools for backup and restore. For local development, your data persists if you use `wrangler dev --local --persist`. For production, refer to Cloudflare's documentation for D1 backup solutions.
Example for creating a local backup:
```bash
# Ensure you are targeting the correct database (local or remote)
# wrangler d1 export puppy_breeder_db --output ./backups/backup_$(date +%Y%m%d).sql --local
```

## Data Relationships (Conceptual Overview)

-   **Core Breeding**: `breeds` -> `litters` -> `puppies`. `stud_dogs` also relates to `breeds` and `users`.
-   **Users & Access**: `users` table stores user information and roles (JSON array).
-   **Transactions**: `transactions` link `users` and `puppies` to payments.
-   **Adoptions**: `adoptions` formalize the link between a `puppy` and a `user`.
-   **Content**: `blog_categories` -> `blog_posts` (with `blog_related_posts` for M2M).
-   **Marketing**: `affiliates` and `promo_codes` stand alone or can be linked to users/transactions through application logic.
-   **Site Configuration**: `email_templates` and `third_party_integrations` store operational settings.
-   **SEO**: `seo_metadata` for page-specific SEO settings.

Understanding these relationships is crucial when designing queries and implementing data access patterns.
