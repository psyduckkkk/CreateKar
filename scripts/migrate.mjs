import { readFileSync } from "fs";
import { resolve } from "path";
import { Pool } from "@neondatabase/serverless";

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Error: DATABASE_URL is not set.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const schemaSql = readFileSync(resolve("scripts/schema.sql"), "utf8");

  console.log("Connecting to Neon PostgreSQL and applying schema...");
  const client = await pool.connect();
  try {
    await client.query(schemaSql);
    console.log("Migration executed successfully! All tables created.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
