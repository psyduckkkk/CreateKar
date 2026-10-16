import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Error: DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function verifyEndToEnd() {
  console.log('--- Verifying Neon Database End-to-End ---');
  const testUserId = `test_user_${Date.now()}`;
  const testHandle = `tester_${Date.now()}`;
  let profileId = null;
  let contractId = null;
  let deliverableId = null;
  let invoiceId = null;

  try {
    // 1. Insert Profile
    console.log('1. Testing insert into profiles table...');
    const insertedProfile = await sql`
      INSERT INTO profiles (
        user_id, role, display_name, handle, bio, niche, starting_rate, city, state, is_verified
      ) VALUES (
        ${testUserId}, 'creator', 'Test Creator', ${testHandle}, 'Bio for testing', 'Tech', 5000.00, 'Bengaluru', 'Karnataka', true
      )
      RETURNING id, display_name, handle, role, starting_rate;
    `;
    profileId = insertedProfile[0].id;
    console.log('   Profile created successfully:', insertedProfile[0]);

    // 2. Insert Contract
    console.log('2. Testing insert into contracts table...');
    const deliverablesData = JSON.stringify([
      { title: 'Tech Review Reel', format: 'Reel', count: 1 }
    ]);
    const insertedContract = await sql`
      INSERT INTO contracts (
        agency_id, creator_id, title, description, deliverables, total_amount, platform_fee, status
      ) VALUES (
        ${profileId}, ${profileId}, 'Q4 Brand Collaboration', 'Contract description', ${deliverablesData}::jsonb, 25000.00, 499.00, 'DRAFT'
      )
      RETURNING id, title, total_amount, platform_fee, status;
    `;
    contractId = insertedContract[0].id;
    console.log('   Contract created successfully:', insertedContract[0]);

    // 3. Insert Deliverable
    console.log('3. Testing insert into deliverables table...');
    const insertedDeliverable = await sql`
      INSERT INTO deliverables (
        contract_id, title, format, status
      ) VALUES (
        ${contractId}, 'Draft Video 1', 'Reel', 'PENDING'
      )
      RETURNING id, title, format, status;
    `;
    deliverableId = insertedDeliverable[0].id;
    console.log('   Deliverable created successfully:', insertedDeliverable[0]);

    // 4. Insert Invoice
    console.log('4. Testing insert into invoices table...');
    const invoiceNumber = `CK/2026-27/${Math.floor(1000 + Math.random() * 9000)}`;
    const insertedInvoice = await sql`
      INSERT INTO invoices (
        contract_id, invoice_number, taxable_amount, cgst_amount, sgst_amount, igst_amount, platform_fee, total_amount
      ) VALUES (
        ${contractId}, ${invoiceNumber}, 25000.00, 2250.00, 2250.00, 0.00, 499.00, 29999.00
      )
      RETURNING id, invoice_number, taxable_amount, total_amount;
    `;
    invoiceId = insertedInvoice[0].id;
    console.log('   Invoice created successfully:', insertedInvoice[0]);

    // 5. Query joined data
    console.log('5. Querying relations across tables...');
    const joined = await sql`
      SELECT 
        c.title AS contract_title,
        p.display_name AS creator_name,
        d.title AS deliverable_title,
        i.invoice_number,
        i.total_amount
      FROM contracts c
      JOIN profiles p ON c.creator_id = p.id
      JOIN deliverables d ON d.contract_id = c.id
      JOIN invoices i ON i.contract_id = c.id
      WHERE c.id = ${contractId};
    `;
    console.log('   Joined query result:', joined[0]);

    // 6. Cleanup test records
    console.log('6. Cleaning up test data...');
    await sql`DELETE FROM invoices WHERE id = ${invoiceId};`;
    await sql`DELETE FROM deliverables WHERE id = ${deliverableId};`;
    await sql`DELETE FROM contracts WHERE id = ${contractId};`;
    await sql`DELETE FROM profiles WHERE id = ${profileId};`;
    console.log('   Cleanup completed cleanly.');

    console.log('\n--- ALL DATABASE CHECKS PASSED SUCCESSFULLY ---');
  } catch (error) {
    console.error('Database verification failed:', error);
    // Cleanup on error if IDs were created
    if (invoiceId) await sql`DELETE FROM invoices WHERE id = ${invoiceId};`.catch(() => {});
    if (deliverableId) await sql`DELETE FROM deliverables WHERE id = ${deliverableId};`.catch(() => {});
    if (contractId) await sql`DELETE FROM contracts WHERE id = ${contractId};`.catch(() => {});
    if (profileId) await sql`DELETE FROM profiles WHERE id = ${profileId};`.catch(() => {});
    process.exit(1);
  }
}

verifyEndToEnd();
