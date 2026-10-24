import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL is not set in environment variables.');
}

/**
 * Neon PostgreSQL connection pool configured according to Neon best practices
 * for pooled connection endpoints (-pooler.c-*.neon.tech)
 */
export const pool = new Pool({
  connectionString: connectionString || undefined,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

/**
 * Executes a parameterized SQL query on the Neon database.
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  return res;
}

/**
 * Validates connectivity to the Neon PostgreSQL instance.
 */
export async function checkNeonConnection(): Promise<{
  connected: boolean;
  database?: string;
  time?: string;
  version?: string;
  error?: string;
}> {
  try {
    const res = await pool.query(
      'SELECT NOW() as current_time, current_database() as database, version() as version;'
    );
    return {
      connected: true,
      database: res.rows[0]?.database,
      time: res.rows[0]?.current_time,
      version: res.rows[0]?.version,
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message || 'Unknown database connection error',
    };
  }
}

export default {
  pool,
  query,
  checkNeonConnection,
};
