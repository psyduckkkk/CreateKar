import { Pool } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import crypto from "crypto";

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not defined in environment.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    console.log("Seeding test creator, agency, contracts, deliverables, and invoices...");

    const passwordHash = await bcrypt.hash("password123", 10);

    // 1. Create or get Demo Creator
    let creatorRes = await client.query("SELECT id FROM users WHERE email = $1", ["creator@createkar.com"]);
    let creatorId;
    if (creatorRes.rows.length === 0) {
      const res = await client.query(
        `INSERT INTO users (email, password_hash, role, name, phone, status)
         VALUES ($1, $2, 'CREATOR', 'Rohan Varma', '+91 9876543210', 'ACTIVE')
         RETURNING id`,
        ["creator@createkar.com", passwordHash]
      );
      creatorId = res.rows[0].id;

      await client.query(
        `INSERT INTO creator_profiles (
          user_id, niche, bio, instagram_handle, youtube_handle, followers_count,
          base_rate_inr, upi_id, bank_account_number, bank_ifsc, gstin, plan_tier,
          badge_type, contracts_created_count, boost_active_until
        ) VALUES (
          $1, 'Tech & AI', 'Creating honest gadget reviews, developer tutorials, and AI demos.',
          '@rohan_tech', 'youtube.com/@rohan_tech', 420000, 65000, 'rohan@okhdfcbank',
          '50100234567890', 'HDFC0001234', '29AABCV1234F1Z9', 'pro', 'verified', 2,
          NOW() + INTERVAL '25 days'
        )`,
        [creatorId]
      );
    } else {
      creatorId = creatorRes.rows[0].id;
    }

    // 2. Create or get Demo Agency
    let agencyRes = await client.query("SELECT id FROM users WHERE email = $1", ["agency@createkar.com"]);
    let agencyId;
    if (agencyRes.rows.length === 0) {
      const res = await client.query(
        `INSERT INTO users (email, password_hash, role, name, phone, status)
         VALUES ($1, $2, 'AGENCY', 'Nexus Performance Marketing', '+91 9123456780', 'ACTIVE')
         RETURNING id`,
        ["agency@createkar.com", passwordHash]
      );
      agencyId = res.rows[0].id;

      await client.query(
        `INSERT INTO agency_profiles (
          user_id, company_name, brand_name, gstin, tan, billing_address, plan_tier, creator_search_limit
        ) VALUES (
          $1, 'Nexus Media Pvt Ltd', 'Nexus Tech Brands', '29AABCN5678F1Z1', 'BLRN12345D',
          'Level 4, Brigade Tech Gardens, Whitefield, Bangalore 560066', 'pro', 10
        )`,
        [agencyId]
      );
    } else {
      agencyId = agencyRes.rows[0].id;
    }

    // 3. Create Sample Contracts
    // Contract 1: Active In-Review contract (Escrow funded, deliverable submitted)
    const contractNumber1 = "CK-2026-0042";
    let contractRes1 = await client.query("SELECT id FROM contracts WHERE contract_number = $1", [contractNumber1]);
    let contractId1;

    if (contractRes1.rows.length === 0) {
      const contractDigest1 = crypto.createHash("sha256").update(contractNumber1 + "75000").digest("hex");
      const res = await client.query(
        `INSERT INTO contracts (
          contract_number, agency_id, creator_id, title, campaign_brief,
          gross_amount_inr, advance_percent, advance_amount_inr, balance_amount_inr,
          payment_mode, signature_method, sha256_digest, tds_section, tds_amount_inr,
          net_payable_inr, agency_signed_at, creator_signed_at, status
        ) VALUES (
          $1, $2, $3, 'AuraPad Pro Launch - 1 Dedicated YouTube Video + 2 Shorts',
          'Create high-production 8-10 min review of AuraPad Pro highlighting stylus latency and developer terminal. Include dedicated call to action in first 3 minutes.',
          75000, 50, 37500, 37500,
          'ESCROW_RAZORPAY', 'SHA256_CRYPTOGRAPHIC', $4, '194C_1PCT', 750, 74250,
          NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', 'IN_REVIEW'
        ) RETURNING id`,
        [contractNumber1, agencyId, creatorId, contractDigest1]
      );
      contractId1 = res.rows[0].id;

      // Deliverable 1: Submitted YouTube Draft
      await client.query(
        `INSERT INTO deliverables (
          contract_id, type, description, deadline, status, submission_url, submission_notes, revision_count
        ) VALUES (
          $1, 'Dedicated YouTube Video (8-10 min)', 'Full review of display, battery, and developer workflow.',
          NOW() + INTERVAL '2 days', 'SUBMITTED', 'https://youtu.be/unlisted_aurapad_draft_v1',
          'Color graded and sound mixed. Audio ducking around B-roll completed as requested.', 0
        )`,
        [contractId1]
      );

      // Deliverable 2: Pending YouTube Short
      await client.query(
        `INSERT INTO deliverables (
          contract_id, type, description, deadline, status, revision_count
        ) VALUES (
          $1, 'YouTube Short / Reel 1', 'Quick 45s unboxing and key feature highlight.',
          NOW() + INTERVAL '7 days', 'PENDING', 0
        )`,
        [contractId1]
      );

      // Escrow Transaction for Advance
      await client.query(
        `INSERT INTO payment_transactions (
          contract_id, payment_mode, amount_inr, razorpay_order_id, razorpay_payment_id, status
        ) VALUES (
          $1, 'ESCROW_RAZORPAY', 37500, 'order_mock_advance_75k', 'pay_mock_advance_75k', 'HELD_IN_ESCROW'
        )`,
        [contractId1]
      );
    }

    // Contract 2: Proposed Deal awaiting Creator Acceptance
    const contractNumber2 = "CK-2026-0089";
    let contractRes2 = await client.query("SELECT id FROM contracts WHERE contract_number = $1", [contractNumber2]);
    if (contractRes2.rows.length === 0) {
      const contractDigest2 = crypto.createHash("sha256").update(contractNumber2 + "45000").digest("hex");
      const res = await client.query(
        `INSERT INTO contracts (
          contract_number, agency_id, creator_id, title, campaign_brief,
          gross_amount_inr, advance_percent, advance_amount_inr, balance_amount_inr,
          payment_mode, signature_method, sha256_digest, tds_section, tds_amount_inr,
          net_payable_inr, agency_signed_at, status
        ) VALUES (
          $1, $2, $3, 'DevFlow AI CLI Tool - Instagram Reel Showcase',
          '30-45s Reel demonstrating automated commit messages and terminal workflow using DevFlow CLI. Tag @devflow_ai.',
          45000, 50, 22500, 22500,
          'DIRECT_P2P', 'SHA256_CRYPTOGRAPHIC', $4, 'NONE', 0, 45000,
          NOW() - INTERVAL '1 day', 'PROPOSED'
        ) RETURNING id`,
        [contractNumber2, agencyId, creatorId, contractDigest2]
      );
      const contractId2 = res.rows[0].id;

      await client.query(
        `INSERT INTO deliverables (
          contract_id, type, description, deadline, status
        ) VALUES (
          $1, 'Instagram Reel (30-45s)', 'Live coding demo of CLI autocomplete.',
          NOW() + INTERVAL '10 days', 'PENDING'
        )`,
        [contractId2]
      );
    }

    // Sample Past Invoice
    const invoiceNumber = "INV-CK-2026-0012";
    let invRes = await client.query("SELECT id FROM invoices WHERE invoice_number = $1", [invoiceNumber]);
    if (invRes.rows.length === 0) {
      await client.query(
        `INSERT INTO invoices (
          invoice_number, contract_id, creator_id, agency_id,
          taxable_value_inr, cgst_inr, sgst_inr, igst_inr, total_inr, watermark_enabled, status
        ) VALUES (
          $1, $2, $3, $4, 50000, 4500, 4500, 0, 59000, true, 'PAID'
        )`,
        [invoiceNumber, contractId1, creatorId, agencyId]
      );
    }

    console.log("Seeding completed successfully!");
    console.log("Demo Creator: creator@createkar.com / password123");
    console.log("Demo Agency: agency@createkar.com / password123");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
