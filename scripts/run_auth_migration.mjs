import { neon } from '@neondatabase/serverless';
import fs from 'fs';

// Read DATABASE_URL from .env if not in environment
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
  console.log('Applying auth columns migration to profiles table...');
  await sql`
    ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
  `;
  console.log('Migration applied successfully.');

  // Check columns on profiles table
  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'profiles'
    ORDER BY ordinal_position;
  `;
  console.log('Profiles table columns:', cols.map(c => c.column_name).join(', '));
}

run().catch(console.error);
