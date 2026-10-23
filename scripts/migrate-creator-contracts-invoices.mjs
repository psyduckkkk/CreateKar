import { Pool } from "@neondatabase/serverless";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is missing.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    console.log("Applying schema migrations for Creator-Initiated Contracts & Invoices...");

    // 1. Make agency_id nullable on contracts and add guest sign & creator-initiated fields
    await client.query(`
      ALTER TABLE contracts ALTER COLUMN agency_id DROP NOT NULL;
      ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);
      ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_email VARCHAR(255);
      ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_phone VARCHAR(50);
      ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_company VARCHAR(255);
      ALTER TABLE contracts ADD COLUMN IF NOT EXISTS guest_sign_token VARCHAR(100) UNIQUE;
      ALTER TABLE contracts ADD COLUMN IF NOT EXISTS created_by_role VARCHAR(20) DEFAULT 'AGENCY';
    `);

    // 2. Make contract_id and agency_id nullable on invoices for standalone creator invoices
    await client.query(`
      ALTER TABLE invoices ALTER COLUMN contract_id DROP NOT NULL;
      ALTER TABLE invoices ALTER COLUMN agency_id DROP NOT NULL;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_email VARCHAR(255);
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_gstin VARCHAR(50);
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_address TEXT;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS service_description TEXT;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sac_code VARCHAR(20) DEFAULT '998311';
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tds_section VARCHAR(50) DEFAULT 'NONE';
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tds_amount_inr INT DEFAULT 0;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_standalone BOOLEAN DEFAULT false;
    `);

    // 3. Add PAN and billing address to creator_profiles if not present
    await client.query(`
      ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS pan VARCHAR(20);
      ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS billing_address TEXT;
    `);

    console.log("Database schema successfully migrated!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    process.exit(0);
  }
}

main();
