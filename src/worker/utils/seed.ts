
import { Env } from '../env';
import { hashPassword } from '../auth';

// Read and execute SQL from a file
export async function seedDatabase(env: Env) {
  try {
    // Read the SQL from seed.sql
    const seedSql = getSeedSQL();
    
    // Run the seed SQL
    await env.PUPPIES_DB.exec(seedSql);
    
    // Create an admin user with a proper password
    const adminPassword = await hashPassword('admin_password');
    await env.PUPPIES_DB.prepare(
      "UPDATE users SET password = ? WHERE email = 'admin@example.com'"
    ).bind(adminPassword).run();
    
    // Create a test user with a known password
    const testPassword = await hashPassword('password123');
    await env.PUPPIES_DB.prepare(
      "INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)"
    ).bind('user@example.com', testPassword, 'Test User', 'customer').run();
    
    console.log('Database seeded successfully');
    return { success: true, initialized: true };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error };
  }
}

// This function returns the seed SQL - in a real project this might read from a file
function getSeedSQL() {
  return `
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
    image_url TEXT,
    growth_progress INTEGER DEFAULT 50,
    trainability INTEGER DEFAULT 70,
    activity_level INTEGER DEFAULT 60,
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
  ('Beagle', 'Merry, friendly, and curious.', 'Medium', 'Merry, Friendly, Curious', 'Regular exercise and ear cleaning.', 18, 30),
  ('German Shepherd', 'Intelligent, confident, and courageous.', 'Large', 'Loyal, Confident, Courageous', 'Daily exercise and regular brushing.', 50, 90),
  ('Poodle', 'Proud, active, and very smart.', 'Varies', 'Intelligent, Active, Alert', 'Regular professional grooming recommended.', 45, 70);

  -- Seed data for litters
  INSERT INTO litters (name, mother, father, breed, date_of_birth, puppy_count, status) VALUES
  ('Summer 2023 Labrador Litter', 'Luna', 'Max', 'Labrador Retriever', '2023-06-15', 6, 'Active'),
  ('Spring 2023 French Bulldog Litter', 'Bella', 'Charlie', 'French Bulldog', '2023-03-10', 4, 'Completed'),
  ('Fall 2023 Golden Retriever Litter', 'Daisy', 'Rocky', 'Golden Retriever', '2023-09-22', 7, 'Active'),
  ('Winter 2024 Beagle Litter', 'Molly', 'Cooper', 'Beagle', '2024-01-05', 5, 'Active'),
  ('Spring 2024 German Shepherd Litter', 'Sadie', 'Duke', 'German Shepherd', '2024-03-15', 6, 'Active'),
  ('Summer 2024 Poodle Litter', 'Coco', 'Oscar', 'Poodle', '2024-06-10', 4, 'Active');

  -- Seed data for puppies
  INSERT INTO puppies (name, breed, gender, birth_date, price, description, status, weight, color, microchipped, litter_id, image_url, growth_progress, trainability, activity_level) VALUES
  ('Buddy', 'Labrador Retriever', 'Male', '2023-06-15', 1200.00, 'Playful and energetic yellow lab puppy with a loving personality. Great with children and other pets.', 'Available', 12.5, 'Yellow', 1, 1, 'https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf', 65, 80, 85),
  ('Lucy', 'Labrador Retriever', 'Female', '2023-06-15', 1200.00, 'Sweet and calm black lab puppy. She loves to cuddle and is already showing signs of being very intelligent.', 'Reserved', 11.0, 'Black', 1, 1, 'https://images.unsplash.com/photo-1608744882201-52a7f7f3dd60', 60, 75, 70),
  ('Oliver', 'French Bulldog', 'Male', '2023-03-10', 2500.00, 'Adorable brindle frenchie with lots of personality. He is very playful and loves attention.', 'Sold', 10.0, 'Brindle', 1, 2, 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee', 100, 65, 60),
  ('Penny', 'French Bulldog', 'Female', '2023-03-10', 2500.00, 'Cute cream colored frenchie, very affectionate and well-behaved. She is fully trained and ready for her forever home.', 'Sold', 9.5, 'Cream', 1, 2, 'https://images.unsplash.com/photo-1521907236370-15adf2297445', 100, 70, 55),
  ('Bailey', 'Golden Retriever', 'Female', '2023-09-22', 1500.00, 'Beautiful golden puppy with a gentle temperament. She is very sociable and gets along well with everyone she meets.', 'Available', 14.0, 'Golden', 1, 3, 'https://images.unsplash.com/photo-1633722715440-8466274fa3d3', 45, 85, 75),
  ('Tucker', 'Golden Retriever', 'Male', '2023-09-22', 1500.00, 'Playful golden puppy, loves to fetch and is showing early signs of being very trainable.', 'Available', 15.5, 'Golden', 1, 3, 'https://images.unsplash.com/photo-1600804931749-2da4ce26c869', 50, 90, 80),
  ('Charlie', 'Beagle', 'Male', '2024-01-05', 1000.00, 'Curious and friendly tricolor beagle with a keen sense of smell. He loves to explore and is very food motivated.', 'Available', 8.5, 'Tricolor', 1, 4, 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2', 25, 65, 90),
  ('Daisy', 'Beagle', 'Female', '2024-01-05', 1000.00, 'Sweet beagle puppy with soulful eyes. She is quieter than her brothers and loves to snuggle.', 'Available', 7.8, 'Tricolor', 1, 4, 'https://images.unsplash.com/photo-1591769225440-811ad7d6eab3', 30, 70, 75),
  ('Max', 'German Shepherd', 'Male', '2024-03-15', 1400.00, 'Strong and confident German Shepherd puppy with excellent pedigree. Shows early signs of being a great guardian.', 'Available', 12.0, 'Black and Tan', 1, 5, 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95', 15, 95, 85),
  ('Bella', 'German Shepherd', 'Female', '2024-03-15', 1400.00, 'Intelligent and loyal German Shepherd puppy. She is attentive and quick to learn new commands.', 'Available', 10.5, 'Black and Tan', 1, 5, 'https://images.unsplash.com/photo-1592754862816-1a21a4ea2281', 15, 90, 80),
  ('Cooper', 'Poodle', 'Male', '2024-06-10', 1300.00, 'Elegant and intelligent standard poodle puppy. Hypoallergenic and great for families with allergies.', 'Available', 5.5, 'Apricot', 1, 6, 'https://images.unsplash.com/photo-1591160690555-5debfba289f0', 5, 95, 70),
  ('Molly', 'Poodle', 'Female', '2024-06-10', 1300.00, 'Beautiful white standard poodle puppy with a gentle disposition. Very smart and eager to please.', 'Available', 5.0, 'White', 1, 6, 'https://images.unsplash.com/photo-1591160690567-dfb4e4643eb5', 5, 90, 65);

  -- Seed data for puppy images
  INSERT INTO puppy_images (puppy_id, image_url, display_order) VALUES
  (1, 'https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf', 0),
  (1, 'https://images.unsplash.com/photo-1591160690555-5debfba289f0', 1),
  (2, 'https://images.unsplash.com/photo-1608744882201-52a7f7f3dd60', 0),
  (2, 'https://images.unsplash.com/photo-1608744873829-75ea4587b25f', 1),
  (3, 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee', 0),
  (3, 'https://images.unsplash.com/photo-1588269845464-8993565cac3a', 1),
  (4, 'https://images.unsplash.com/photo-1521907236370-15adf2297445', 0),
  (4, 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7', 1),
  (5, 'https://images.unsplash.com/photo-1633722715440-8466274fa3d3', 0),
  (5, 'https://images.unsplash.com/photo-1633722715365-475bc5f7c5ca', 1),
  (6, 'https://images.unsplash.com/photo-1600804931749-2da4ce26c869', 0),
  (6, 'https://images.unsplash.com/photo-1600804931766-7b96fdd0577d', 1),
  (7, 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2', 0),
  (7, 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd', 1),
  (8, 'https://images.unsplash.com/photo-1591769225440-811ad7d6eab3', 0),
  (8, 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993', 1),
  (9, 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95', 0),
  (9, 'https://images.unsplash.com/photo-1561037404-61cd46aa615b', 1),
  (10, 'https://images.unsplash.com/photo-1592754862816-1a21a4ea2281', 0),
  (10, 'https://images.unsplash.com/photo-1589838016216-576802b2d4e6', 1),
  (11, 'https://images.unsplash.com/photo-1591160690555-5debfba289f0', 0),
  (11, 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9', 1),
  (12, 'https://images.unsplash.com/photo-1591160690567-dfb4e4643eb5', 0),
  (12, 'https://images.unsplash.com/photo-1626682455939-6cd4241364e1', 1);

  -- Set up parent-child relationships
  INSERT INTO puppy_parents (puppy_id, parent_id, relation_type) VALUES
  (1, 2, 'Mother'),
  (3, 4, 'Mother');
  `;
}
