import { readFileSync } from "fs";
import { resolve } from "path";
import { Pool } from "@neondatabase/serverless";

async function resetDb() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    console.log("Dropping existing tables and rebuilding fresh CreateKar 2.0 schema...");
    await client.query(`
      DROP TABLE IF EXISTS payment_transactions CASCADE;
      DROP TABLE IF EXISTS invoices CASCADE;
      DROP TABLE IF EXISTS deliverables CASCADE;
      DROP TABLE IF EXISTS contracts CASCADE;
      DROP TABLE IF EXISTS agency_profiles CASCADE;
      DROP TABLE IF EXISTS creator_profiles CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    const schemaSql = readFileSync(resolve("scripts/schema.sql"), "utf8");
    await client.query(schemaSql);
    console.log("Fresh schema applied successfully!");
  } catch (err) {
    console.error("Reset DB error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDb();
