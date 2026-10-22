-- CreateKar 2.0 Database Schema (Neon PostgreSQL)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('CREATOR', 'AGENCY', 'ADMIN', 'SUPER_ADMIN')),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'BANNED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Creator Profiles
CREATE TABLE IF NOT EXISTS creator_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    niche VARCHAR(100),
    bio TEXT,
    instagram_handle VARCHAR(100),
    youtube_handle VARCHAR(100),
    followers_count INT DEFAULT 0,
    base_rate_inr INT DEFAULT 0,
    upi_id VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(20),
    gstin VARCHAR(20),
    plan_tier VARCHAR(50) NOT NULL DEFAULT 'basic' CHECK (plan_tier IN ('basic', 'pro', 'influencer')),
    badge_type VARCHAR(50) NOT NULL DEFAULT 'none' CHECK (badge_type IN ('none', 'verified', 'famous')),
    contracts_created_count INT DEFAULT 0,
    boost_active_until TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Agency Profiles
CREATE TABLE IF NOT EXISTS agency_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    gstin VARCHAR(20),
    tan VARCHAR(20),
    billing_address TEXT,
    plan_tier VARCHAR(50) NOT NULL DEFAULT 'basic' CHECK (plan_tier IN ('basic', 'pro', 'enterprise')),
    creator_search_limit INT NOT NULL DEFAULT 5,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Contracts Table (Dual-Mode: Escrow & P2P)
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    agency_id UUID NOT NULL REFERENCES users(id),
    creator_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    campaign_brief TEXT NOT NULL,
    gross_amount_inr INT NOT NULL,
    advance_percent INT NOT NULL DEFAULT 50,
    advance_amount_inr INT NOT NULL,
    balance_amount_inr INT NOT NULL,
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'ESCROW_RAZORPAY' CHECK (payment_mode IN ('ESCROW_RAZORPAY', 'DIRECT_P2P')),
    signature_method VARCHAR(50) NOT NULL DEFAULT 'SHA256_CRYPTOGRAPHIC' CHECK (signature_method IN ('SHA256_CRYPTOGRAPHIC', 'AADHAAR_ESIGN_OPT_IN')),
    sha256_digest VARCHAR(128),
    tds_section VARCHAR(50) NOT NULL DEFAULT 'NONE' CHECK (tds_section IN ('NONE', '194C_1PCT', '194C_2PCT', '194J_2PCT', '194J_10PCT')),
    tds_amount_inr INT NOT NULL DEFAULT 0,
    net_payable_inr INT NOT NULL,
    agency_signed_at TIMESTAMPTZ,
    creator_signed_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'PROPOSED' CHECK (status IN ('DRAFT', 'PROPOSED', 'NEGOTIATION', 'ACCEPTED', 'FUNDED', 'IN_REVIEW', 'COMPLETED', 'DISPUTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Deliverables Table
CREATE TABLE IF NOT EXISTS deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUBMITTED', 'REVISION_REQUESTED', 'APPROVED')),
    submission_url VARCHAR(500),
    submission_notes TEXT,
    revision_notes TEXT,
    revision_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id),
    agency_id UUID NOT NULL REFERENCES users(id),
    taxable_value_inr INT NOT NULL,
    cgst_inr INT NOT NULL DEFAULT 0,
    sgst_inr INT NOT NULL DEFAULT 0,
    igst_inr INT NOT NULL DEFAULT 0,
    total_inr INT NOT NULL,
    watermark_enabled BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(50) NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('DRAFT', 'ISSUED', 'PAID')),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    payment_mode VARCHAR(50) NOT NULL,
    amount_inr INT NOT NULL,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_transfer_id VARCHAR(100),
    p2p_utr_number VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'HELD_IN_ESCROW', 'RELEASED', 'CONFIRMED', 'FAILED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
