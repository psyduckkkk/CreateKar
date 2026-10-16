import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Error: DATABASE_URL is not set in environment or .env');
  process.exit(1);
}

const sql = neon(databaseUrl);

/**
 * Split SQL text into separate executable statements,
 * taking PostgreSQL dollar-quoted blocks ($$ ... $$) into account.
 */
function splitSqlStatements(sqlText) {
  const statements = [];
  let currentStatement = '';
  let inDollarQuote = false;
  let dollarTag = '';

  const lines = sqlText.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    // Skip full comment lines outside dollar quotes
    if (!inDollarQuote && trimmedLine.startsWith('--')) {
      continue;
    }

    // Check for dollar-quoting delimiter ($$ or $tag$)
    const dollarMatches = line.match(/\$[a-zA-Z0-9_]*\$/g);
    if (dollarMatches) {
      for (const match of dollarMatches) {
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarTag = match;
        } else if (match === dollarTag) {
          inDollarQuote = false;
          dollarTag = '';
        }
      }
    }

    currentStatement += line + '\n';

    if (!inDollarQuote && trimmedLine.endsWith(';')) {
      const stmt = currentStatement.trim();
      if (stmt.length > 0) {
        statements.push(stmt);
      }
      currentStatement = '';
    }
  }

  const remainder = currentStatement.trim();
  if (remainder.length > 0) {
    statements.push(remainder);
  }

  return statements;
}

async function runMigration() {
  try {
    console.log('Connecting to Neon database...');
    const migrationPath = resolve(__dirname, 'migrate.sql');
    const sqlContent = readFileSync(migrationPath, 'utf-8');

    const statements = splitSqlStatements(sqlContent);
    console.log(`Found ${statements.length} SQL statements to execute.`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      // Print first line of each statement for clear logging
      const firstLine = stmt.split('\n')[0].substring(0, 60);
      console.log(`[${i + 1}/${statements.length}] Executing: ${firstLine}...`);
      await sql(stmt);
    }

    console.log('All migration statements executed successfully.');

    // Verify tables
    console.log('Verifying created tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('profiles', 'contracts', 'deliverables', 'invoices')
      ORDER BY table_name;
    `;

    console.log('Created tables verified:');
    tables.forEach((t) => console.log(` - ${t.table_name}`));

    if (tables.length === 4) {
      console.log('SUCCESS: All 4 tables (profiles, contracts, deliverables, invoices) exist and are verified.');
    } else {
      console.warn(`Warning: Expected 4 tables, found ${tables.length}`);
    }

    // Verify table columns count
    const columns = await sql`
      SELECT table_name, count(*) as column_count
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('profiles', 'contracts', 'deliverables', 'invoices')
      GROUP BY table_name
      ORDER BY table_name;
    `;

    console.log('Table column counts:');
    columns.forEach((c) => console.log(` - ${c.table_name}: ${c.column_count} columns`));

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
