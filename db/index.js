const dotenv = require('dotenv');

const pg = require('pg');

dotenv.config();

const client = new pg.Client({
  host: 'db.bgbwjqnfrkviqsxrzupq.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.POSTGRES_DATABASE_PASSWORD,
});

const initDb = async () => {
  await client.connect();
  console.log('Connected to the database');
};

const query = (text, params, callback) => {
  return client.query(text, params, callback);
};

const end = () => {
  return client.end();
};

module.exports = { initDb, query, end };
