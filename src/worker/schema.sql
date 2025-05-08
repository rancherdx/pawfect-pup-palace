
-- Schema for Puppy Breeder Application

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an initial admin user (password needs to be hashed in production)
INSERT OR IGNORE INTO users (email, password, name, role) VALUES 
('admin@puppybreeder.com', 'admin_password_hash', 'Admin', 'admin');

-- Litters Table
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

-- Puppies Table
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

-- Puppy Images Table
CREATE TABLE IF NOT EXISTS puppy_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    puppy_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    FOREIGN KEY (puppy_id) REFERENCES puppies(id)
);

-- Puppy Parents Relationship Table
CREATE TABLE IF NOT EXISTS puppy_parents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    puppy_id INTEGER NOT NULL,
    parent_id INTEGER NOT NULL,
    relation_type TEXT NOT NULL, -- 'Father' or 'Mother'
    FOREIGN KEY (puppy_id) REFERENCES puppies(id),
    FOREIGN KEY (parent_id) REFERENCES puppies(id)
);

-- Puppy Temperament Tags Table
CREATE TABLE IF NOT EXISTS puppy_temperament (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    puppy_id INTEGER NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (puppy_id) REFERENCES puppies(id)
);

-- Customer Information Table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    address TEXT,
    phone TEXT,
    preferences TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Applications/Adoptions Table
CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    puppy_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected
    application_data TEXT NOT NULL, -- JSON data with all the form answers
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (puppy_id) REFERENCES puppies(id)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    application_id INTEGER,
    amount REAL NOT NULL,
    payment_type TEXT NOT NULL, -- Deposit, Full Payment, etc.
    payment_method TEXT NOT NULL, -- Credit Card, PayPal, etc.
    transaction_id TEXT,
    status TEXT NOT NULL, -- Pending, Completed, Failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (application_id) REFERENCES applications(id)
);

-- Health Records Table
CREATE TABLE IF NOT EXISTS health_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    puppy_id INTEGER NOT NULL,
    record_type TEXT NOT NULL, -- Vaccination, Checkup, etc.
    record_date TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (puppy_id) REFERENCES puppies(id)
);
