
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
