require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  console.log('Testing Neon PostgreSQL Connection...');
  const connectionString = process.env.DATABASE_URL;
  console.log('Using DATABASE_URL host:', connectionString ? connectionString.split('@')[1]?.split('/')[0] : 'Not found');

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    const client = await pool.connect();
    console.log('Connected to Neon PostgreSQL successfully!');
    
    const res = await client.query('SELECT NOW() as current_time, current_database() as database, version() as version;');
    console.log('Database Info:');
    console.log('  Current Time:', res.rows[0].current_time);
    console.log('  Database Name:', res.rows[0].database);
    console.log('  Version:', res.rows[0].version);

    client.release();
    await pool.end();
    console.log('Neon Postgres connection test PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('Neon connection failed:', err);
    process.exit(1);
  }
}

testConnection();
