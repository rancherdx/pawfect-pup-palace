import type { Env } from '../env';

// Redis-like interface using Cloudflare KV as a Redis substitute
export class RedisClient {
  private kv: KVNamespace;

  constructor(env: Env) {
    // Using AUTH_STORE KV namespace as Redis substitute
    this.kv = env.AUTH_STORE;
  }

  // Set a key-value pair with optional TTL
  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      const options: { expirationTtl?: number } = {};
      if (ttlSeconds) {
        options.expirationTtl = ttlSeconds;
      }
      await this.kv.put(key, value, options);
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  // Get a value by key
  async get(key: string): Promise<string | null> {
    try {
      return await this.kv.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  // Delete a key
  async del(key: string): Promise<boolean> {
    try {
      await this.kv.delete(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const value = await this.kv.get(key);
      return value !== null;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // Set with expiration (alias for set with TTL)
  async setex(key: string, ttlSeconds: number, value: string): Promise<boolean> {
    return this.set(key, value, ttlSeconds);
  }

  // Increment a numeric value
  async incr(key: string): Promise<number> {
    try {
      const current = await this.get(key);
      const newValue = (parseInt(current || '0') + 1).toString();
      await this.set(key, newValue);
      return parseInt(newValue);
    } catch (error) {
      console.error('Redis INCR error:', error);
      return 0;
    }
  }

  // Decrement a numeric value
  async decr(key: string): Promise<number> {
    try {
      const current = await this.get(key);
      const newValue = (parseInt(current || '0') - 1).toString();
      await this.set(key, newValue);
      return parseInt(newValue);
    } catch (error) {
      console.error('Redis DECR error:', error);
      return 0;
    }
  }

  // Set multiple key-value pairs
  async mset(keyValues: Record<string, string>): Promise<boolean> {
    try {
      const promises = Object.entries(keyValues).map(([key, value]) =>
        this.set(key, value)
      );
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Redis MSET error:', error);
      return false;
    }
  }

  // Get multiple values by keys
  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      const promises = keys.map(key => this.get(key));
      return await Promise.all(promises);
    } catch (error) {
      console.error('Redis MGET error:', error);
      return keys.map(() => null);
    }
  }

  // List keys matching a pattern (limited implementation)
  async keys(pattern: string): Promise<string[]> {
    try {
      // KV doesn't support pattern matching directly
      // This is a simplified implementation
      console.warn('Redis KEYS with patterns not fully supported in KV. Use with caution.');
      const { keys } = await this.kv.list({ prefix: pattern.replace('*', '') });
      return keys.map(key => key.name);
    } catch (error) {
      console.error('Redis KEYS error:', error);
      return [];
    }
  }

  // Hash operations (using JSON serialization)
  async hset(key: string, field: string, value: string): Promise<boolean> {
    try {
      const hash = await this.hgetall(key) || {};
      hash[field] = value;
      return await this.set(key, JSON.stringify(hash));
    } catch (error) {
      console.error('Redis HSET error:', error);
      return false;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      const hash = await this.hgetall(key);
      return hash ? hash[field] || null : null;
    } catch (error) {
      console.error('Redis HGET error:', error);
      return null;
    }
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    try {
      const value = await this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis HGETALL error:', error);
      return null;
    }
  }

  async hdel(key: string, field: string): Promise<boolean> {
    try {
      const hash = await this.hgetall(key);
      if (hash && hash[field]) {
        delete hash[field];
        return await this.set(key, JSON.stringify(hash));
      }
      return false;
    } catch (error) {
      console.error('Redis HDEL error:', error);
      return false;
    }
  }

  // Cache operations with automatic serialization
  async setCache<T>(key: string, data: T, ttlSeconds: number = 3600): Promise<boolean> {
    try {
      const serialized = JSON.stringify(data);
      return await this.set(`cache:${key}`, serialized, ttlSeconds);
    } catch (error) {
      console.error('Cache SET error:', error);
      return false;
    }
  }

  async getCache<T>(key: string): Promise<T | null> {
    try {
      const value = await this.get(`cache:${key}`);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache GET error:', error);
      return null;
    }
  }

  async delCache(key: string): Promise<boolean> {
    return await this.del(`cache:${key}`);
  }
}

// Utility functions for common Redis patterns
export class RedisUtils {
  private redis: RedisClient;

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  // Rate limiting
  async rateLimit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number }> {
    const rateLimitKey = `rate_limit:${key}`;
    const current = await this.redis.incr(rateLimitKey);
    
    if (current === 1) {
      await this.redis.setex(rateLimitKey, windowSeconds, '1');
    }
    
    const allowed = current <= limit;
    const remaining = Math.max(0, limit - current);
    
    return { allowed, remaining };
  }

  // Session management
  async createSession(sessionId: string, userData: any, ttlSeconds: number = 86400): Promise<boolean> {
    return await this.redis.setCache(`session:${sessionId}`, userData, ttlSeconds);
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    return await this.redis.getCache<T>(`session:${sessionId}`);
  }

  async destroySession(sessionId: string): Promise<boolean> {
    return await this.redis.delCache(`session:${sessionId}`);
  }

  // Lock mechanism
  async acquireLock(lockKey: string, ttlSeconds: number = 30): Promise<boolean> {
    const lockId = crypto.randomUUID();
    const success = await this.redis.set(`lock:${lockKey}`, lockId, ttlSeconds);
    return success;
  }

  async releaseLock(lockKey: string): Promise<boolean> {
    return await this.redis.del(`lock:${lockKey}`);
  }
}