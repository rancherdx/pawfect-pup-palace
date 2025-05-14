
/// <reference types="vite/client" />

// Cloudflare Workers types
interface D1Database {
  prepare: (query: string) => D1PreparedStatement;
  batch: (statements: D1PreparedStatement[]) => Promise<D1Result[]>;
  exec: (query: string) => Promise<D1Result>;
}

interface D1PreparedStatement {
  bind: (...values: any[]) => D1PreparedStatement;
  first: <T = any>(colName?: string) => Promise<T>;
  run: () => Promise<D1Result>;
  all: <T = any>() => Promise<D1ResultSet<T>>;
  raw: <T = any>() => Promise<T[]>;
}

interface D1Result {
  success: boolean;
  error?: string;
  meta?: {
    duration: number;
    changes: number;
    last_row_id: number;
    changed_db: boolean;
    size_after: number;
  };
  results?: any[];
}

interface D1ResultSet<T = any> {
  results: T[];
  success: boolean;
  error?: string;
  meta?: any;
}

