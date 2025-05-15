
# Database Architecture and Setup

This document outlines the database structure and setup process for the Puppy Breeder App.

## Database Technology

The application uses Cloudflare D1, a serverless SQL database that integrates seamlessly with Cloudflare Workers.

## Schema Design

The database schema consists of the following primary tables:

### Users Table

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  roles TEXT NOT NULL DEFAULT '["user"]',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_login INTEGER,
  force_password_change BOOLEAN DEFAULT 0
);
```

### Puppies Table

```sql
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
```

### Litters Table

```sql
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
```

### Parent Dogs Table

```sql
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
```

## Indexes for Performance

```sql
CREATE INDEX idx_puppies_litter ON puppies(litter_id);
CREATE INDEX idx_puppies_status ON puppies(status);
CREATE INDEX idx_puppies_breed ON puppies(breed);
CREATE INDEX idx_litters_breed ON litters(breed);
CREATE INDEX idx_users_email ON users(email);
```

## Setup and Initialization

### Creating the D1 Database

```bash
wrangler d1 create puppy_breeder_db
```

Add the resulting binding to your `wrangler.toml`:

```toml
[[d1_databases]]
binding = "PUPPIES_DB"
database_name = "puppy_breeder_db"
database_id = "your-database-id"
```

### Initializing the Schema

```bash
wrangler d1 execute puppy_breeder_db --file=./src/worker/schema.sql
```

### Seeding Initial Data

```bash
wrangler d1 execute puppy_breeder_db --file=./src/worker/seed.sql
```

## Database API

### D1 Client Usage

```typescript
// Example: Fetching a puppy by ID
async function getPuppy(puppyId, env) {
  const stmt = env.PUPPIES_DB.prepare(
    'SELECT * FROM puppies WHERE id = ?'
  ).bind(puppyId);
  
  return await stmt.first();
}

// Example: Creating a new puppy
async function createPuppy(puppyData, env) {
  const { name, breed, birth_date, gender, color, price, litter_id, description, image_url } = puppyData;
  
  const stmt = env.PUPPIES_DB.prepare(`
    INSERT INTO puppies (id, name, breed, birth_date, gender, color, price, litter_id, description, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    name,
    breed,
    birth_date,
    gender,
    color,
    price,
    litter_id,
    description,
    image_url
  );
  
  return await stmt.run();
}
```

### Transactions

For operations that require multiple statements, use transactions:

```typescript
async function addPuppyWithHealthRecords(puppyData, healthRecords, env) {
  // Create an array of prepared statements
  const statements = [];
  
  const puppyId = crypto.randomUUID();
  
  // Prepare puppy insertion
  statements.push(
    env.PUPPIES_DB.prepare(`
      INSERT INTO puppies (id, name, breed, birth_date, gender, color, price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      puppyId,
      puppyData.name,
      puppyData.breed,
      puppyData.birthDate,
      puppyData.gender,
      puppyData.color,
      puppyData.price
    )
  );
  
  // Prepare health records insertions
  for (const record of healthRecords) {
    statements.push(
      env.PUPPIES_DB.prepare(`
        INSERT INTO health_records (id, puppy_id, record_type, record_date, description)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        crypto.randomUUID(),
        puppyId,
        record.type,
        record.date,
        record.description
      )
    );
  }
  
  // Execute all statements in a batch (transaction)
  return await env.PUPPIES_DB.batch(statements);
}
```

## Database Migrations

For future schema updates, create migration scripts:

```sql
-- migrations/001_add_payment_tables.sql
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  puppy_id TEXT,
  amount REAL NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (puppy_id) REFERENCES puppies(id)
);
```

Execute migrations:

```bash
wrangler d1 execute puppy_breeder_db --file=./migrations/001_add_payment_tables.sql
```

## Backup and Restore

To backup the database:

```bash
wrangler d1 backup puppy_breeder_db ./backups/backup_$(date +%Y%m%d).sql
```

For local development, you can use the local D1 database:

```bash
wrangler dev --local --persist
```

## Data Relationships

- Puppies belong to Litters
- Litters have Parent Dogs (mom and dad)
- Parent Dogs can be used as Stud Dogs
- Users can place Reservations on Puppies
- Payments are linked to Users and Puppies

Understanding these relationships is crucial when designing queries and implementing data access patterns.
