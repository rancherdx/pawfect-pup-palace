
import { Env } from './env';
import { seedDatabase } from './utils/seed';

export async function initializeDatabase(env: Env) {
  // Check if DB is already initialized
  try {
    const tableCheck = await env.PUPPIES_DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    ).all();
    
    if (tableCheck.results.length === 0) {
      console.log('Database not initialized. Running seed...');
      return await seedDatabase(env);
    } else {
      console.log('Database already initialized.');
      return { success: true, initialized: false };
    }
  } catch (error) {
    console.error('Error checking/initializing database:', error);
    return { success: false, error };
  }
}
