-- Migration: Add email and password_hash to profiles for authentication
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
