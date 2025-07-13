-- Quick deployment script for WhatsApp OTPs table
-- Run this in your Supabase SQL editor to enable proper OTP verification

-- Create WhatsApp OTPs table for secure verification
CREATE TABLE IF NOT EXISTS whatsapp_otps (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_phone_format CHECK (phone_number ~ '^\+[1-9]\d{1,14}$'),
  CONSTRAINT valid_otp_format CHECK (otp_code ~ '^\d{6}$')
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_otps_phone_expiry 
ON whatsapp_otps(phone_number, expires_at);

-- Enable RLS (Row Level Security)
ALTER TABLE whatsapp_otps ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow service role to manage OTPs
CREATE POLICY "Service role can manage whatsapp_otps" ON whatsapp_otps
FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions to service role
GRANT ALL ON whatsapp_otps TO service_role;
GRANT USAGE ON SEQUENCE whatsapp_otps_id_seq TO service_role;

-- Create function to automatically clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM whatsapp_otps WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Verify table was created successfully
SELECT 'WhatsApp OTPs table created successfully!' as status;
