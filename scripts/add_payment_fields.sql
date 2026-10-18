-- Add payment tracking fields to contracts and create platform_payments table

ALTER TABLE contracts 
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) DEFAULT 'UNPAID',
  ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_contracts_payment_status ON contracts(payment_status);
CREATE INDEX IF NOT EXISTS idx_contracts_razorpay_order ON contracts(razorpay_order_id);

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

CREATE INDEX IF NOT EXISTS idx_platform_payments_contract_id ON platform_payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_platform_payments_order_id ON platform_payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_platform_payments_payment_id ON platform_payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_platform_payments_status ON platform_payments(status);
