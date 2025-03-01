
const logger = require('./logger');
const {supaconnectionstring} = require('./config');

// config/db.js
const { Pool } = require('pg');



//Create a PostgreSQL pool using Supabase connection string
const pool = new Pool({
  connectionString: supaconnectionstring,
  ssl: { rejectUnauthorized: false } // Required for Supabase connections
});


const initDB = async () => {
  try {
    const client = await pool.connect();
    logger.info('Database connected successfully to Supabase');

    // Create Users table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(10) CHECK (role IN ('user', 'admin')) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create Tasks table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) CHECK (status IN ('pending', 'in progress', 'completed')) DEFAULT 'pending',
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create a trigger to update updated_at automatically
    await client.query(`
      DO $$
        BEGIN
          -- First check if the function exists
          IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_set_timestamp') THEN
            -- Create the timestamp function
            CREATE FUNCTION trigger_set_timestamp()
            RETURNS TRIGGER AS $BODY$
            BEGIN
              NEW.updated_at = NOW();
              RETURN NEW;
            END;
            $BODY$ LANGUAGE plpgsql;
          END IF;
          
          -- Then check if triggers exist and create them if they don't
          IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_users') THEN
            CREATE TRIGGER set_timestamp_users
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION trigger_set_timestamp();
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_tasks') THEN
            CREATE TRIGGER set_timestamp_tasks
            BEFORE UPDATE ON tasks
            FOR EACH ROW
            EXECUTE FUNCTION trigger_set_timestamp();
          END IF;
        END
        $$;
`);

    client.release();
    logger.info('Database tables initialized successfully');
  } catch (error) {
    logger.error('Database initialization error:', error);
    process.exit(1);
  }
};

// Helper to convert MySQL-style queries to PostgreSQL
const query = async (text, params) => {
  // Convert ? placeholders to $1, $2, etc.
  let pgText = text;
  let paramCounter = 0;
  pgText = pgText.replace(/\?/g, () => `$${++paramCounter}`);
  
  try {
    const result = await pool.query(pgText, params);
    return [result.rows, result.fields];
  } catch (error) {
    logger.error('Query error:', error);
    throw error;
  }
};

module.exports = { pool, initDB, query };