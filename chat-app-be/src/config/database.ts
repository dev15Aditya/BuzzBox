import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const dbConfig: PoolConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  database: process.env.DB_NAME,

  ssl: {
    rejectUnauthorized: true,
    ca: process.env.DB_CERT
  }
};

// pool instance
const pool = new Pool(dbConfig);

// Error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function testConnection() {
  const testPool = new Pool(dbConfig);
  try {
    console.log('Attempting to connect to database...');
    const client = await testPool.connect();
    console.log('Successfully connected to database');
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0].version);
    client.release();
  } catch (err) {
    console.error('Detailed connection error:', err);
    throw err;
  } finally {
    await testPool.end();
  }
}

export { pool, testConnection };