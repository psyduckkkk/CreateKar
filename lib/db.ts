import { neon } from '@neondatabase/serverless';
import type { DbResult } from '@/types/database';

/**
 * Helper to obtain a configured Neon SQL client using process.env.DATABASE_URL.
 * Evaluates DATABASE_URL at call time to support runtime environment variables in serverless routes.
 */
export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not defined.');
  }
  return neon(connectionString);
}

/**
 * Tagged template literal for running parameterized SQL queries with Neon.
 */
export const sql = (strings: TemplateStringsArray, ...values: unknown[]) => {
  const client = getDb();
  return client(strings, ...values);
};

/**
 * Execute a parameterized query with typed success/error result.
 * Prevents silent error swallowing and provides clear, actionable error feedback.
 */
export async function query<T = unknown>(
  queryText: string,
  params: unknown[] = []
): Promise<DbResult<T[]>> {
  try {
    const client = getDb();
    const rows = (await client(queryText, params)) as unknown as T[];
    return {
      success: true,
      data: rows,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database query error';
    const errorCode = typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : 'DB_QUERY_ERROR';

    return {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details: error,
      },
    };
  }
}

/**
 * Execute a query returning at most one single row.
 */
export async function queryOne<T = unknown>(
  queryText: string,
  params: unknown[] = []
): Promise<DbResult<T | null>> {
  const result = await query<T>(queryText, params);

  if (!result.success) {
    return result;
  }

  const row = result.data.length > 0 ? result.data[0] : null;
  return {
    success: true,
    data: row,
  };
}

/**
 * Execute an INSERT / UPDATE / DELETE command and return affected status.
 */
export async function execute(
  queryText: string,
  params: unknown[] = []
): Promise<DbResult<{ rowCount: number }>> {
  try {
    const client = getDb();
    const result = await client(queryText, params);
    const rowCount = Array.isArray(result) ? result.length : 0;

    return {
      success: true,
      data: { rowCount },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database execution error';
    const errorCode = typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : 'DB_EXECUTION_ERROR';

    return {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details: error,
      },
    };
  }
}
