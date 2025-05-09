
import { Env } from '../env';

/**
 * Seeds the database with initial data
 */
export async function seedDatabase(env: Env) {
  try {
    console.log('Starting database seeding...');
    
    // Read SQL from seed file
    // Note: In a real implementation, this would read from a file
    // Since we can't directly read files in this environment, implement in-memory SQL execution
    
    // Execute database migrations
    const result = await env.PUPPIES_DB.exec(`
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
    `);
    
    // Insert seed data for users
    await env.PUPPIES_DB.prepare(
      `INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`
    ).bind('admin@example.com', 'hashed_admin_password', 'Admin User', 'admin').run();
    
    await env.PUPPIES_DB.prepare(
      `INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`
    ).bind('customer@example.com', 'hashed_customer_password', 'Customer User', 'customer').run();
    
    // Insert seed data for breeds
    await env.PUPPIES_DB.prepare(
      `INSERT INTO breeds (name, description, size, temperament, care_instructions, avg_weight_min, avg_weight_max) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      'Labrador Retriever', 
      'A friendly, outgoing, and high-spirited companion.',
      'Large',
      'Friendly, Active, Outgoing',
      'Regular exercise and grooming needed.',
      55,
      80
    ).run();
    
    await env.PUPPIES_DB.prepare(
      `INSERT INTO breeds (name, description, size, temperament, care_instructions, avg_weight_min, avg_weight_max) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      'French Bulldog', 
      'Playful, alert, adaptable, and completely irresistible.',
      'Small',
      'Playful, Smart, Adaptable',
      'Moderate exercise and regular cleaning of facial folds.',
      16,
      28
    ).run();
    
    // Insert litters and puppies with similar prepared statements
    
    console.log('Database seeding completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error };
  }
}
