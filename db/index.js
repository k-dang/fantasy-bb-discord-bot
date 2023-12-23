const dotenv = require('dotenv');

const { Pool } = require('pg');

dotenv.config();

const pool = new Pool({
  host: 'db.bgbwjqnfrkviqsxrzupq.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.POSTGRES_DATABASE_PASSWORD,
});

const query = (text, params, callback) => {
  return pool.query(text, params, callback);
};

module.exports = { query };
