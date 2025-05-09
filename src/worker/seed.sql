
-- Initial setup for the database with sample data

-- Reset tables if they exist
DROP TABLE IF EXISTS puppy_parents;
DROP TABLE IF EXISTS puppy_images;
DROP TABLE IF EXISTS puppies;
DROP TABLE IF EXISTS litters;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS breeds;

-- Create users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create breeds table
CREATE TABLE breeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  size TEXT,
  temperament TEXT,
  care_instructions TEXT,
  avg_weight_min FLOAT,
  avg_weight_max FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create litters table
CREATE TABLE litters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  mother TEXT,
  father TEXT,
  breed TEXT NOT NULL,
  date_of_birth TIMESTAMP,
  puppy_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create puppies table
CREATE TABLE puppies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  gender TEXT NOT NULL,
  birth_date TIMESTAMP,
  price DECIMAL(10, 2),
  description TEXT,
  status TEXT DEFAULT 'Available',
  weight FLOAT,
  color TEXT,
  microchipped BOOLEAN DEFAULT 0,
  litter_id INTEGER,
  square_status TEXT DEFAULT 'Not Synced',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (litter_id) REFERENCES litters (id)
);

-- Create puppy images table
CREATE TABLE puppy_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  puppy_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (puppy_id) REFERENCES puppies (id)
);

-- Create puppy parents relationship table
CREATE TABLE puppy_parents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  puppy_id INTEGER NOT NULL,
  parent_id INTEGER NOT NULL,
  relation_type TEXT NOT NULL, -- 'Mother' or 'Father'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (puppy_id) REFERENCES puppies (id),
  FOREIGN KEY (parent_id) REFERENCES puppies (id)
);

-- Seed data for users
INSERT INTO users (email, password, name, role) VALUES 
('admin@example.com', 'hashed_password_here', 'Admin User', 'admin'),
('customer@example.com', 'hashed_password_here', 'Customer User', 'customer');

-- Seed data for breeds
INSERT INTO breeds (name, description, size, temperament, care_instructions, avg_weight_min, avg_weight_max) VALUES
('Labrador Retriever', 'A friendly, outgoing, and high-spirited companion.', 'Large', 'Friendly, Active, Outgoing', 'Regular exercise and grooming needed.', 55, 80),
('French Bulldog', 'Playful, alert, adaptable, and completely irresistible.', 'Small', 'Playful, Smart, Adaptable', 'Moderate exercise and regular cleaning of facial folds.', 16, 28),
('Golden Retriever', 'Intelligent, friendly, and devoted.', 'Large', 'Friendly, Reliable, Trustworthy', 'Daily exercise and regular grooming.', 55, 75),
('Beagle', 'Merry, friendly, and curious.', 'Medium', 'Merry, Friendly, Curious', 'Regular exercise and ear cleaning.', 18, 30);

-- Seed data for litters
INSERT INTO litters (name, mother, father, breed, date_of_birth, puppy_count, status) VALUES
('Summer 2023 Labrador Litter', 'Luna', 'Max', 'Labrador Retriever', '2023-06-15', 6, 'Active'),
('Spring 2023 French Bulldog Litter', 'Bella', 'Charlie', 'French Bulldog', '2023-03-10', 4, 'Completed'),
('Fall 2023 Golden Retriever Litter', 'Daisy', 'Rocky', 'Golden Retriever', '2023-09-22', 7, 'Active'),
('Winter 2023 Beagle Litter', 'Molly', 'Cooper', 'Beagle', '2023-12-05', 5, 'Upcoming');

-- Seed data for puppies
INSERT INTO puppies (name, breed, gender, birth_date, price, description, status, weight, color, microchipped, litter_id, square_status) VALUES
('Buddy', 'Labrador Retriever', 'Male', '2023-06-15', 1200.00, 'Playful and energetic yellow lab puppy', 'Available', 12.5, 'Yellow', 1, 1, 'Not Synced'),
('Lucy', 'Labrador Retriever', 'Female', '2023-06-15', 1200.00, 'Sweet and calm black lab puppy', 'Reserved', 11.0, 'Black', 1, 1, 'Synced'),
('Oliver', 'French Bulldog', 'Male', '2023-03-10', 2500.00, 'Adorable brindle frenchie with lots of personality', 'Sold', 10.0, 'Brindle', 1, 2, 'Synced'),
('Penny', 'French Bulldog', 'Female', '2023-03-10', 2500.00, 'Cute cream colored frenchie, very affectionate', 'Sold', 9.5, 'Cream', 1, 2, 'Synced'),
('Bailey', 'Golden Retriever', 'Female', '2023-09-22', 1500.00, 'Beautiful golden puppy with a gentle temperament', 'Available', 14.0, 'Golden', 1, 3, 'Not Synced'),
('Tucker', 'Golden Retriever', 'Male', '2023-09-22', 1500.00, 'Playful golden puppy, loves to fetch', 'Available', 15.5, 'Golden', 1, 3, 'Not Synced'),
('Charlie', 'Beagle', 'Male', '2023-12-05', 1000.00, 'Curious and friendly tricolor beagle', 'Upcoming', null, 'Tricolor', 0, 4, 'Not Synced');

-- Seed data for puppy images
INSERT INTO puppy_images (puppy_id, image_url, display_order) VALUES
(1, 'https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf', 0),
(1, 'https://images.unsplash.com/photo-1591160690555-5debfba289f0', 1),
(2, 'https://images.unsplash.com/photo-1608744882201-52a7f7f3dd60', 0),
(3, 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee', 0),
(3, 'https://images.unsplash.com/photo-1588269845464-8993565cac3a', 1),
(4, 'https://images.unsplash.com/photo-1521907236370-15adf2297445', 0),
(5, 'https://images.unsplash.com/photo-1633722715440-8466274fa3d3', 0),
(5, 'https://images.unsplash.com/photo-1633722715365-475bc5f7c5ca', 1),
(6, 'https://images.unsplash.com/photo-1600804931749-2da4ce26c869', 0);

-- Set up parent-child relationships
INSERT INTO puppy_parents (puppy_id, parent_id, relation_type) VALUES
(1, 2, 'Mother'),
(3, 4, 'Mother');
