import { neon } from '@neondatabase/serverless';
import fs from 'fs';

let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=')) {
      databaseUrl = trimmed.substring('DATABASE_URL='.length).replace(/^["']|["']$/g, '');
      break;
    }
  }
}

if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function run() {
  console.log('Applying payment migration...');
  await sql`
    ALTER TABLE contracts 
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) DEFAULT 'UNPAID',
      ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255);
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_contracts_payment_status ON contracts(payment_status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contracts_razorpay_order ON contracts(razorpay_order_id);`;

  await sql`
    CREATE TABLE IF NOT EXISTS platform_payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
        agency_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        fee_type VARCHAR(50) NOT NULL DEFAULT 'PLATFORM_FEE',
        amount NUMERIC(12, 2) NOT NULL DEFAULT 499.00,
        currency VARCHAR(10) NOT NULL DEFAULT 'INR',
        razorpay_order_id VARCHAR(255) NOT NULL,
        razorpay_payment_id VARCHAR(255),
        razorpay_signature VARCHAR(255),
        status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`ALTER TABLE platform_payments ADD COLUMN IF NOT EXISTS fee_type VARCHAR(50) DEFAULT 'PLATFORM_FEE';`;
  await sql`ALTER TABLE platform_payments ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES profiles(id) ON DELETE SET NULL;`;
  await sql`CREATE INDEX IF NOT EXISTS idx_platform_payments_contract_id ON platform_payments(contract_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_platform_payments_order_id ON platform_payments(razorpay_order_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_platform_payments_payment_id ON platform_payments(razorpay_payment_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_platform_payments_status ON platform_payments(status);`;

  console.log('Payment migration applied successfully.');

  // Verify contracts columns
  const contractCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'contracts'
    ORDER BY ordinal_position;
  `;
  console.log('Contracts columns:', contractCols.map(c => c.column_name).join(', '));

  // Verify platform_payments columns
  const paymentCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'platform_payments'
    ORDER BY ordinal_position;
  `;
  console.log('Platform Payments columns:', paymentCols.map(c => c.column_name).join(', '));
}

run().catch(console.error);
