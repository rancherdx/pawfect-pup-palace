export interface Env {
  // KV Namespace
  AUTH_STORE: KVNamespace;

  // D1 Database
  PUPPIES_DB: D1Database;

  // R2 Buckets
  PUPPY_IMAGES: R2Bucket;

  // Durable Objects
  SESSIONS: DurableObjectNamespace;

  // Environment Vars
  ENV: string;

  // Secrets
  SQUARE_ACCESS_TOKEN: string;
  SENDGRID_API_KEY: string;
  INTERNAL_WEBHOOK_SECRET: string;
  STRIPE_SECRET_KEY: string;
}