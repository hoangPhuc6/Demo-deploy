const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const SCHEMA_PATH = path.resolve(__dirname, "..", "..", "sql", "schema.sql");
const SEED_PATH = path.resolve(__dirname, "..", "..", "sql", "seed.sql");

const initializeDatabase = async () => {
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  let pool;
  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
    });
  } else {
    const dbHost = process.env.DB_HOST || "localhost";
    const dbPort = parseInt(process.env.DB_PORT, 10) || 5432;
    const dbUser = process.env.DB_USER || "clms";
    const dbPassword = process.env.DB_PASSWORD || "clms_dev";
    const dbName = process.env.DB_NAME || "clms_db";
    pool = new Pool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      max: 5,
    });
  }

  const seed = fs.readFileSync(SEED_PATH, "utf8");
  try {
    await pool.query(schema);
    await pool.query(seed);
    console.log("[bootstrap] Seed complete.");
  } catch (err) {
    if (err && err.code === "23505") {
      console.log("[bootstrap] Seed skipped (already exists).");
      return;
    }
    throw err;
  } finally {
    await pool.end();
  }
};

module.exports = { initializeDatabase };
