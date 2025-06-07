
export interface Env {
  // KV Namespace
  AUTH_STORE: KVNamespace;
  STATIC_ASSETS: R2Bucket;

  // D1 Database
  PUPPIES_DB: D1Database;

  // R2 Buckets
  PUPPY_IMAGES: R2Bucket;

  // Durable Objects
  SESSIONS: DurableObjectNamespace;

  // Environment Vars
  ENV: string;
  ENVIRONMENT_NAME: string;

  // Secrets
  JWT_SECRET: string;
  SQUARE_ACCESS_TOKEN: string;
  SQUARE_LOCATION_ID: string;
  SQUARE_WEBHOOK_SIGNATURE_KEY: string;
  SENDGRID_API_KEY: string;
  INTERNAL_WEBHOOK_SECRET: string;
  STRIPE_SECRET_KEY: string;
  ENCRYPTION_KEY_SECRET: string;
  
  // Marketing related keys
  AFFILIATE_TRACKING_SECRET: string;
  SEO_API_KEY: string;
}
