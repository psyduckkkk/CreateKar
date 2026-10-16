import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import bcrypt from 'bcryptjs';

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

const sql = neon(databaseUrl);

async function seed() {
  const passwordHash = await bcrypt.hash('CreateKar2026!', 12);

  console.log('Setting passwords for all users to: CreateKar2026!');

  // Check admin
  const admin = await sql`SELECT id, email, role FROM profiles WHERE email = 'admin@createkar.com'`;
  if (admin.length > 0) {
    await sql`UPDATE profiles SET password_hash = ${passwordHash}, role = 'admin' WHERE id = ${admin[0].id}`;
    console.log('Admin ready:', admin[0].email);
  }

  // Check agency
  const agency = await sql`SELECT id, email, role FROM profiles WHERE email = 'agency@createkar.com'`;
  if (agency.length > 0) {
    await sql`UPDATE profiles SET password_hash = ${passwordHash}, role = 'agency' WHERE id = ${agency[0].id}`;
    console.log('Agency ready:', agency[0].email);
  }

  // Update creators
  const creators = await sql`SELECT id, handle, email FROM profiles WHERE role = 'creator'`;
  for (const c of creators) {
    const email = c.email || (c.handle === '@priyastyle' ? 'creator@createkar.com' : `${c.handle.replace('@', '').toLowerCase()}@createkar.com`);
    await sql`UPDATE profiles SET email = ${email}, password_hash = ${passwordHash} WHERE id = ${c.id}`;
    console.log(`Creator ${c.handle}: ${email}`);
  }

  const all = await sql`SELECT id, email, role, handle FROM profiles WHERE email IS NOT NULL`;
  console.log('\nAll registered users:');
  console.table(all);
}

seed().catch(console.error);
