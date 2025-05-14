
import { Env } from './env';
import { seedDatabase } from './utils/seed';

// Function to check if a table exists in the database
async function tableExists(db: D1Database, tableName: string): Promise<boolean> {
  try {
    const result = await db.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
    ).bind(tableName).all();
    
    return result.results.length > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// Function to initialize the database schema
async function initializeSchema(env: Env): Promise<boolean> {
  try {
    // Read schema SQL from /worker/schema.sql
    // In a real implementation, this would read from a file
    // For now, we'll execute the schema SQL directly
    
    await env.PUPPIES_DB.exec(`
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
      ('admin@puppybreeder.com', 'admin_password_hash', 'Admin', 'admin'),
      ('gsawyer@puppybreeder.com', 'Password123$Puppies', 'GSawyer', 'super-admin'),
      ('drancher@puppybreeder.com', 'Password123$Puppies', 'DRancher', 'super-admin');

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

      -- Blog Posts Table
      CREATE TABLE IF NOT EXISTS blog_posts (
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
          FOREIGN KEY (author_id) REFERENCES users(id)
      );

      -- Blog Tags Table
      CREATE TABLE IF NOT EXISTS blog_tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          slug TEXT UNIQUE NOT NULL
      );

      -- Blog Post Tags (Junction Table)
      CREATE TABLE IF NOT EXISTS blog_post_tags (
          post_id INTEGER NOT NULL,
          tag_id INTEGER NOT NULL,
          PRIMARY KEY (post_id, tag_id),
          FOREIGN KEY (post_id) REFERENCES blog_posts(id),
          FOREIGN KEY (tag_id) REFERENCES blog_tags(id)
      );

      -- Stud Dogs Table
      CREATE TABLE IF NOT EXISTS stud_dogs (
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
    `);
    
    return true;
  } catch (error) {
    console.error('Error initializing schema:', error);
    return false;
  }
}

export async function initializeDatabase(env: Env) {
  console.log('Checking if database needs initialization...');
  
  try {
    // Check if users table exists as a proxy for whether DB is initialized
    const usersTableExists = await tableExists(env.PUPPIES_DB, 'users');
    
    if (!usersTableExists) {
      console.log('Database not initialized. Running schema creation...');
      const schemaInitialized = await initializeSchema(env);
      
      if (schemaInitialized) {
        console.log('Schema created successfully. Seeding database...');
        return await seedDatabase(env);
      } else {
        return { success: false, error: 'Failed to initialize schema' };
      }
    } else {
      console.log('Database already initialized.');
      return { success: true, initialized: false };
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error };
  }
}
