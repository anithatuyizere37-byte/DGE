const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('WARNING: DATABASE_URL is not set in environment variables.');
}

/**
 * Neon PostgreSQL connection pool configured for serverless pooling
 */
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle Neon PostgreSQL client:', err);
});

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  return res;
}

async function getClient() {
  const client = await pool.connect();
  return client;
}

async function checkHealth() {
  try {
    const res = await pool.query(
      'SELECT NOW() as current_time, current_database() as database, version() as version;'
    );
    return {
      connected: true,
      database: res.rows[0].database,
      time: res.rows[0].current_time,
      version: res.rows[0].version,
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
}

module.exports = {
  pool,
  query,
  getClient,
  checkHealth,
};
