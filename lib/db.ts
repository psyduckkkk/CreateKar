import { Pool } from "@neondatabase/serverless";

// Singleton pool instance for serverless Next.js route handlers
let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not defined.");
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

/**
 * Execute a type-safe SQL query against Neon PostgreSQL
 */
export async function query<T = any>(text: string, params: any[] = []): Promise<T[] & { rows: T[] }> {
  const client = getDbPool();
  try {
    const res = await client.query(text, params);
    const rows = res.rows as any;
    rows.rows = res.rows;
    return rows;
  } catch (error) {
    console.error("Database query execution error:", { text, error });
    throw error;
  }
}
