
# Database Schema

The Puppy Breeder App uses Cloudflare D1 (SQLite) for data storage.

## Tables Overview

### Users Table
Stores user accounts and authentication information.

```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Litters Table
Stores information about puppy litters.

```sql
CREATE TABLE IF NOT EXISTS litters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    mother TEXT NOT NULL,
    father TEXT NOT NULL,
    breed TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    puppy_count INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Puppies Table
Stores details about individual puppies.

```sql
CREATE TABLE IF NOT EXISTS puppies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    breed TEXT NOT NULL,
    gender TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Available',
    weight TEXT,
    color TEXT,
    litter_id INTEGER,
    growth_progress INTEGER DEFAULT 0,
    trainability INTEGER DEFAULT 50,
    activity_level INTEGER DEFAULT 50,
    microchipped BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (litter_id) REFERENCES litters(id)
);
```

## Additional Tables

- `puppy_images` - Stores image URLs for puppies
- `puppy_parents` - Tracks parent-child relationships between puppies
- `puppy_temperament` - Stores temperament tags for puppies
- `customers` - Extended information about customer users
- `applications` - Adoption applications
- `payments` - Payment records
- `health_records` - Health records for puppies

For the complete schema, see `src/worker/schema.sql`.

## Database Maintenance

### Initialization
```bash
wrangler d1 execute puppy_breeder_db --file=./src/worker/schema.sql
```

### Backups
```bash
wrangler d1 export puppy_breeder_db > backup-$(date +%Y%m%d).sql
```

### Running Migrations
```bash
wrangler d1 execute puppy_breeder_db --file=./migrations/[migration-file].sql
```
