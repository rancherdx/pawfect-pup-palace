
-- Initial setup for the database with sample data

-- Reset tables if they exist
DROP TABLE IF EXISTS blog_post_tags;
DROP TABLE IF EXISTS blog_tags;
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS stud_dogs;
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

-- Create blog posts table
CREATE TABLE blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id INTEGER,
  featured_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, published
  category TEXT,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users (id)
);

-- Create blog tags table
CREATE TABLE blog_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- Create blog post tags junction table
CREATE TABLE blog_post_tags (
  post_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES blog_posts (id),
  FOREIGN KEY (tag_id) REFERENCES blog_tags (id)
);

-- Create stud dogs table
CREATE TABLE stud_dogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  age INTEGER NOT NULL,
  price REAL NOT NULL,
  image_url TEXT,
  description TEXT,
  temperament TEXT,
  certifications TEXT, -- Stored as JSON
  status TEXT NOT NULL DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data for users
INSERT INTO users (email, password, name, role) VALUES 
('admin@example.com', 'hashed_password_here', 'Admin User', 'admin'),
('customer@example.com', 'hashed_password_here', 'Customer User', 'customer'),
('gsawyer@puppybreeder.com', 'Password123$Puppies', 'GSawyer', 'super-admin'),
('drancher@puppybreeder.com', 'Password123$Puppies', 'DRancher', 'super-admin'),
('sarah.johnson@example.com', 'hashed_password_here', 'Dr. Sarah Johnson', 'author'),
('michael.williams@example.com', 'hashed_password_here', 'Dr. Michael Williams', 'author');

-- Seed data for breeds
INSERT INTO breeds (name, description, size, temperament, care_instructions, avg_weight_min, avg_weight_max) VALUES
('Labrador Retriever', 'A friendly, outgoing, and high-spirited companion.', 'Large', 'Friendly, Active, Outgoing', 'Regular exercise and grooming needed.', 55, 80),
('French Bulldog', 'Playful, alert, adaptable, and completely irresistible.', 'Small', 'Playful, Smart, Adaptable', 'Moderate exercise and regular cleaning of facial folds.', 16, 28),
('Golden Retriever', 'Intelligent, friendly, and devoted.', 'Large', 'Friendly, Reliable, Trustworthy', 'Daily exercise and regular grooming.', 55, 75),
('Beagle', 'Merry, friendly, and curious.', 'Medium', 'Merry, Friendly, Curious', 'Regular exercise and ear cleaning.', 18, 30),
('German Shepherd', 'Confident, courageous, and smart.', 'Large', 'Confident, Courageous, Smart', 'Regular exercise and mental stimulation.', 50, 90);

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

-- Seed data for blog tags
INSERT INTO blog_tags (name, slug) VALUES
('Puppy Care', 'puppy-care'),
('Training', 'training'),
('Health', 'health'),
('Nutrition', 'nutrition'),
('Behavior', 'behavior'),
('New Puppy', 'new-puppy'),
('Vaccinations', 'vaccinations'),
('Socialization', 'socialization');

-- Seed data for blog posts
INSERT INTO blog_posts (title, slug, content, excerpt, author_id, featured_image, status, category, published_at) VALUES
('Top 10 Tips for New Puppy Owners', 'top-10-tips-for-new-puppy-owners', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Essential advice for welcoming your new furry friend home and setting up a successful routine.', 5, 'https://images.unsplash.com/photo-1591160690555-5debfba289f0', 'published', 'puppy-care', '2023-05-15'),
('Puppy Vaccination Schedule: What You Need to Know', 'puppy-vaccination-schedule', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'A comprehensive guide to your puppy's vaccination needs from 8 weeks through adulthood.', 6, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb', 'published', 'health', '2023-06-22'),
('Crate Training Made Easy', 'crate-training-made-easy', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Learn how to make crate training a positive experience for your new puppy with these expert tips.', 5, 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8', 'published', 'training', '2023-07-05'),
('Nutritional Needs for Growing Puppies', 'nutritional-needs-for-growing-puppies', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Understanding the specific dietary requirements of puppies to ensure healthy growth and development.', 6, 'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35', 'published', 'nutrition', '2023-08-12'),
('Socialization: The Key to a Well-Adjusted Dog', 'socialization-key-to-well-adjusted-dog', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Why socializing your puppy in their early months is crucial for developing a confident, friendly adult dog.', 5, 'https://images.unsplash.com/photo-1543466835-00a7907e9de1', 'published', 'behavior', '2023-09-03'),
('Common Puppy Health Issues to Watch For', 'common-puppy-health-issues', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Learn to recognize signs of common health problems in puppies and when to seek veterinary care.', 6, 'https://images.unsplash.com/photo-1583337426008-3e0f66dfe274', 'published', 'health', '2023-10-17');

-- Connect blog posts with tags
INSERT INTO blog_post_tags (post_id, tag_id) VALUES
(1, 1), (1, 6), -- Top 10 Tips: Puppy Care, New Puppy
(2, 3), (2, 7), -- Vaccination Schedule: Health, Vaccinations
(3, 2), (3, 1), -- Crate Training: Training, Puppy Care
(4, 4), (4, 1), -- Nutritional Needs: Nutrition, Puppy Care
(5, 5), (5, 8), -- Socialization: Behavior, Socialization
(6, 3), (6, 1); -- Health Issues: Health, Puppy Care

-- Seed data for stud dogs
INSERT INTO stud_dogs (name, breed, age, price, image_url, description, temperament, certifications, status) VALUES
('Zeus', 'German Shepherd', 4, 1800, 'https://images.unsplash.com/photo-1552053831-71594a27632d', 'Champion bloodline German Shepherd with excellent temperament and health clearances.', 'Confident, alert and fearless with a strong territorial instinct', '["AKC Certified", "OFA Hip Good", "OFA Elbow Normal"]', 'Available'),
('Apollo', 'Golden Retriever', 3, 1600, 'https://images.unsplash.com/photo-1561298169-9db0d83ab716', 'Beautiful Golden Retriever stud with perfect conformation and gentle disposition.', 'Friendly, reliable, and trustworthy with an eager-to-please attitude', '["AKC Certified", "OFA Heart Clear", "CERF Clear"]', 'Available'),
('Thor', 'Labrador Retriever', 4, 1700, 'https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf', 'Champion retriever from hunting bloodlines with excellent health history.', 'Kind, outgoing, and eager to please with strong retrieving instincts', '["AKC Certified", "OFA Hip Excellent", "OFA Elbows Normal", "EIC Clear"]', 'Available'),
('Rocky', 'French Bulldog', 3, 2200, 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee', 'Rare blue French Bulldog stud with confirmed genetic health testing.', 'Playful, alert, adaptable with a sweet and affectionate nature', '["AKC Certified", "BAER Hearing Test", "Cardiac Clear"]', 'Available');
