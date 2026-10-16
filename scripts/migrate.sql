-- CreateKar Database Migration Script
-- Idempotent schema for core deal lifecycle: profiles, contracts, deliverables, invoices

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('creator', 'agency', 'admin')),
    display_name VARCHAR(255) NOT NULL,
    handle VARCHAR(100) UNIQUE NOT NULL,
    bio TEXT,
    niche VARCHAR(100),
    avatar_url TEXT,
    starting_rate NUMERIC(12, 2) DEFAULT 0.00,
    upi_id VARCHAR(100),
    pan_number VARCHAR(10),
    gstin VARCHAR(15),
    city VARCHAR(100),
    state VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_handle ON profiles(handle);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 2. Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    platform_fee NUMERIC(12, 2) NOT NULL DEFAULT 499.00,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (
        status IN ('DRAFT', 'PROPOSED', 'ACCEPTED', 'DECLINED', 'FUNDED', 'IN_REVIEW', 'COMPLETED', 'DISPUTED')
    ),
    deadline TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    accepted_ip VARCHAR(64),
    accepted_user_agent TEXT,
    signature_hash VARCHAR(64),
    terms_snapshot JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contracts_agency_id ON contracts(agency_id);
CREATE INDEX IF NOT EXISTS idx_contracts_creator_id ON contracts(creator_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_deadline ON contracts(deadline);

-- 3. Deliverables Table
CREATE TABLE IF NOT EXISTS deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    format VARCHAR(100) NOT NULL,
    file_url TEXT,
    preview_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'SUBMITTED', 'REVISION_REQUESTED', 'APPROVED')
    ),
    revision_notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deliverables_contract_id ON deliverables(contract_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON deliverables(status);

-- 4. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    taxable_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    cgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    igst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    platform_fee NUMERIC(12, 2) NOT NULL DEFAULT 499.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoices_contract_id ON invoices(contract_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- Helper trigger for automatic updated_at timestamp updates
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_contracts_updated_at') THEN
        CREATE TRIGGER trg_contracts_updated_at
        BEFORE UPDATE ON contracts
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_deliverables_updated_at') THEN
        CREATE TRIGGER trg_deliverables_updated_at
        BEFORE UPDATE ON deliverables
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp_column();
    END IF;
END $$;
