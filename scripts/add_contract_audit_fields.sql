-- Migration to add cryptographic contract integrity, audit trail, and terms snapshot columns
ALTER TABLE contracts 
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_ip VARCHAR(64),
  ADD COLUMN IF NOT EXISTS accepted_user_agent TEXT,
  ADD COLUMN IF NOT EXISTS signature_hash VARCHAR(64),
  ADD COLUMN IF NOT EXISTS terms_snapshot JSONB;
