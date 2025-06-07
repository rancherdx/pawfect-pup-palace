-- master_schema.sql

-- Base tables for puppies and litters
CREATE TABLE IF NOT EXISTS breeds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- Added UNIQUE constraint for breed name
  description TEXT,
  temperament TEXT, -- General temperament
  size TEXT, -- e.g., Small, Medium, Large
  lifespan TEXT, -- e.g., 10-12 years
  care_instructions TEXT, -- New: Detailed care instructions
  common_traits TEXT, -- New: JSON array of strings, e.g., ["Friendly", "Intelligent"]
  average_weight_min REAL, -- New: Minimum average weight
  average_weight_max REAL, -- New: Maximum average weight
  photo_url TEXT, -- New: URL to a representative photo of the breed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS litters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  breed_id TEXT REFERENCES breeds(id) ON DELETE SET NULL, -- Allow breed to be nullable or set to a default if breed is deleted
  dam_name TEXT NOT NULL,
  sire_name TEXT NOT NULL,
  born_date DATE,
  available_date DATE,
  description TEXT,
  price REAL, -- Default price for puppies in this litter, can be overridden by puppy price
  status TEXT DEFAULT 'upcoming', -- e.g., upcoming, available, all_reserved, all_sold, archived
  image_urls TEXT, -- JSON array of image URLs for the litter itself
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS puppies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  litter_id TEXT REFERENCES litters(id) ON DELETE CASCADE, -- If litter is deleted, puppies of that litter are removed
  gender TEXT NOT NULL, -- e.g., Male, Female
  color TEXT,
  birth_date DATE, -- Can be derived from litter, but useful for direct query
  weight REAL, -- Current weight in pounds/kg
  price REAL, -- Specific price for this puppy, may differ from litter default
  status TEXT DEFAULT 'available', -- e.g., available, reserved, adopted, pending_pickup
  microchip_id TEXT UNIQUE, -- Microchip ID should be unique
  description TEXT,
  temperament_notes TEXT, -- Specific notes about this puppy's temperament
  health_notes TEXT, -- Specific health notes or records
  image_urls TEXT, -- JSON array of image URLs for this specific puppy
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NOT NULL, -- Stored as a secure hash
  roles TEXT DEFAULT '["user"]', -- JSON array of roles, e.g., ["user"], ["admin"], ["super-admin"]
  phone TEXT NULL,
  address TEXT NULL,
  preferences TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS adoptions (
  id TEXT PRIMARY KEY,
  puppy_id TEXT UNIQUE REFERENCES puppies(id) ON DELETE RESTRICT, -- Puppy can only be adopted once
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL, -- Keep adoption record even if user is deleted
  adoption_date DATE,
  price REAL, -- Actual price paid
  payment_status TEXT, -- e.g., pending_deposit, deposit_paid, paid_in_full, refunded
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog functionality
CREATE TABLE IF NOT EXISTS blog_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
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
  author_id TEXT REFERENCES users(id) ON DELETE SET NULL, -- Link to a user as author
  category_id TEXT REFERENCES blog_categories(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft', -- e.g., draft, published, archived
  published_at TIMESTAMP,
  featured_image_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for blog post tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS blog_tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id TEXT REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id TEXT REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Marketing and Promotions
CREATE TABLE IF NOT EXISTS affiliates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  referral_code TEXT UNIQUE NOT NULL, -- Renamed from 'code' for clarity
  commission_rate REAL DEFAULT 10.0, -- Commission percentage (e.g., 10.0 for 10%)
  total_visits INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_sales_amount REAL DEFAULT 0.0, -- Renamed from 'total_sales'
  is_active BOOLEAN DEFAULT TRUE, -- Renamed from 'active'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promo_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- 'percentage' or 'fixed_amount'
  discount_value REAL NOT NULL, -- Renamed from 'discount_amount'
  uses_count INTEGER DEFAULT 0, -- Renamed from 'uses'
  max_uses INTEGER, -- NULL for unlimited
  start_date DATE NOT NULL,
  end_date DATE, -- NULL for no expiration
  is_active BOOLEAN DEFAULT TRUE, -- Renamed from 'active'
  min_purchase_amount REAL DEFAULT 0.0, -- Minimum purchase amount for promo to apply
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Site-wide SEO and Settings
CREATE TABLE IF NOT EXISTS seo_page_metadata ( -- Renamed from 'seo_metadata' for clarity
  page_path TEXT PRIMARY KEY, -- e.g., '/', '/about', '/litters/:id' (use patterns for dynamic)
  title TEXT,
  description TEXT,
  keywords TEXT, -- Comma-separated list
  og_image_url TEXT, -- Renamed from 'ogImage'
  seo_score INTEGER, -- Renamed from 'score', can be calculated by an external tool
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Example site_settings:
-- ('siteName', 'GDS Puppies')
-- ('contactEmail', 'contact@gdspuppies.com')
-- ('maintenanceMode', 'false') -- 'true' or 'false'
-- ('logoUrl', '/images/logo.png')
-- ('defaultLanguage', 'en-US')
-- ('currency', 'USD')
-- ('socialMediaLinks', '{"facebook": "...", "instagram": "..."}') -- JSON
-- ('seoDefaults', '{"title": "...", "description": "..."}') -- JSON

-- Transactions and Integrations
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  related_entity_id TEXT, -- e.g., puppy_id, litter_id (for deposit), or other saleable item id
  entity_type TEXT, -- e.g., 'puppy_sale', 'litter_deposit', 'stud_service_fee'
  square_payment_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL, -- Store amount in cents to avoid floating point issues
  currency TEXT NOT NULL, -- e.g., 'USD'
  payment_method_details TEXT, -- JSON details from payment provider
  status TEXT NOT NULL, -- e.g., 'pending', 'succeeded', 'failed', 'refunded'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Changed to use default
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Changed to use default
);

CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY, -- e.g., 'welcome_email', 'payment_receipt'
  template_name TEXT UNIQUE NOT NULL, -- Renamed from 'name'
  subject_template TEXT NOT NULL, -- Renamed from 'subject'
  html_body_template TEXT NOT NULL, -- Renamed from 'html_body'
  is_system_template BOOLEAN NOT NULL DEFAULT TRUE, -- Renamed from 'is_editable_in_admin' (inverted logic)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Changed to use default
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Changed to use default
);

CREATE TABLE IF NOT EXISTS third_party_integrations (
  id TEXT PRIMARY KEY,
  service_name TEXT UNIQUE NOT NULL, -- e.g., 'Square', 'SendGrid', 'TawkTo'
  encrypted_api_key TEXT, -- Application handles encryption/decryption
  other_config TEXT, -- JSON for additional settings like Property IDs, Webhook Secrets etc.
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Changed to use default
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Changed to use default
);

CREATE TABLE IF NOT EXISTS puppy_health_records (
  id TEXT PRIMARY KEY,
  puppy_id TEXT REFERENCES puppies(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL, -- e.g., 'vaccination', 'weight_log', 'height_log', 'document', 'note'
  date DATE NOT NULL,
  details TEXT, -- For notes, document URL/title, vaccine name, weight value (e.g. "15.2 lbs"), etc.
  value REAL NULL, -- Optional: For numeric values like weight, height
  unit TEXT NULL, -- Optional: e.g., 'lbs', 'kg', 'in', 'cm'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT, -- e.g., "Chat about Bella", "Inquiry about adoption"
  related_entity_id TEXT NULL, -- e.g., puppy_id, litter_id
  related_entity_type TEXT NULL, -- e.g., 'puppy', 'litter', 'general_support'
  last_message_preview TEXT NULL, -- Store first few words of the last message
  last_message_at TIMESTAMP,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT, -- Can be user_id or a system/admin identifier like 'admin_01', 'breeder_gds'
  sender_type TEXT NOT NULL, -- 'user', 'admin', 'system', 'breeder'
  content TEXT NOT NULL,
  attachments TEXT NULL, -- JSON array of attachment URLs or identifiers
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Renamed from 'timestamp' for clarity
  read_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS stud_dogs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  breed_id TEXT REFERENCES breeds(id) ON DELETE SET NULL,
  date_of_birth DATE, -- Changed from 'age' for precision
  description TEXT,
  temperament TEXT, -- General temperament
  health_certifications TEXT, -- JSON array of strings, e.g., ["OFA Hips: Good", "CERF: Clear"] (renamed)
  stud_fee REAL NOT NULL,
  image_urls TEXT, -- JSON array of strings
  is_available BOOLEAN DEFAULT TRUE,
  owner_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  contact_info TEXT, -- Public contact info for stud owner if different from user profile
  location TEXT, -- General location of the stud dog
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Changed to use default
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Changed to use default
);

-- Indexes (some might be redundant if primary/unique keys already create them, but explicit is fine)
-- Core Entities
CREATE INDEX IF NOT EXISTS idx_puppies_litter_id ON puppies(litter_id);
CREATE INDEX IF NOT EXISTS idx_puppies_status ON puppies(status);
CREATE INDEX IF NOT EXISTS idx_litters_breed_id ON litters(breed_id);
CREATE INDEX IF NOT EXISTS idx_litters_status ON litters(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_adoptions_puppy_id ON adoptions(puppy_id);
CREATE INDEX IF NOT EXISTS idx_adoptions_user_id ON adoptions(user_id);
CREATE INDEX IF NOT EXISTS idx_stud_dogs_breed_id ON stud_dogs(breed_id);
CREATE INDEX IF NOT EXISTS idx_stud_dogs_is_available ON stud_dogs(is_available);
CREATE INDEX IF NOT EXISTS idx_stud_dogs_owner_user_id ON stud_dogs(owner_user_id);

-- Blog
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag_id ON blog_post_tags(tag_id);

-- Marketing
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);

-- Operations
CREATE INDEX IF NOT EXISTS idx_transactions_square_payment_id ON transactions(square_payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_email_templates_template_name ON email_templates(template_name);
CREATE INDEX IF NOT EXISTS idx_third_party_integrations_service_name ON third_party_integrations(service_name);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_puppy_health_records_puppy_id ON puppy_health_records(puppy_id);
CREATE INDEX IF NOT EXISTS idx_puppy_health_records_record_type ON puppy_health_records(record_type);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_related_entity ON conversations(related_entity_id, related_entity_type);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, sender_type);

-- Removed blog_related_posts as it's less common and can be complex.
-- A simpler approach is often keyword/category based recommendations or manual linking in content.
-- If needed, it can be added back:
-- CREATE TABLE IF NOT EXISTS blog_related_posts (
--   post_id TEXT REFERENCES blog_posts(id) ON DELETE CASCADE,
--   related_post_id TEXT REFERENCES blog_posts(id) ON DELETE CASCADE,
--   PRIMARY KEY (post_id, related_post_id),
--   CHECK (post_id != related_post_id) -- Ensure a post is not related to itself
-- );
