-- COPY AND PASTE THIS ENTIRE SCRIPT INTO YOUR SUPABASE SQL EDITOR
-- This will create all necessary tables for WhatsApp OTP Analytics

-- Step 1: Create WhatsApp OTPs table
CREATE TABLE IF NOT EXISTS whatsapp_otps (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_phone_format CHECK (phone_number ~ '^\+[1-9]\d{1,14}$'),
  CONSTRAINT valid_otp_format CHECK (otp_code ~ '^\d{6}$')
);

-- Step 2: Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_otps_phone_expiry 
ON whatsapp_otps(phone_number, expires_at);

-- Step 3: Enable Row Level Security
ALTER TABLE whatsapp_otps ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policy for service role
DROP POLICY IF EXISTS "Service role can manage whatsapp_otps" ON whatsapp_otps;
CREATE POLICY "Service role can manage whatsapp_otps" ON whatsapp_otps
FOR ALL USING (auth.role() = 'service_role');

-- Step 5: Grant permissions
GRANT ALL ON whatsapp_otps TO service_role;
GRANT USAGE ON SEQUENCE whatsapp_otps_id_seq TO service_role;

-- Step 6: Create WhatsApp OTP Analytics table
CREATE TABLE IF NOT EXISTS whatsapp_otp_analytics (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'send_attempt',
      'send_success',
      'send_failure', 
      'verify_attempt',
      'verify_success',
      'verify_failure',
      'expired'
    )
  ),
  event_data JSONB DEFAULT '{}',
  contractor_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_phone_format_analytics CHECK (phone_number ~ '^\+[1-9]\d{1,14}$')
);

-- Step 7: Create indexes for analytics table
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_phone ON whatsapp_otp_analytics(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_event ON whatsapp_otp_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_date ON whatsapp_otp_analytics(created_at);

-- Step 8: Enable RLS on analytics table
ALTER TABLE whatsapp_otp_analytics ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies for analytics table
DROP POLICY IF EXISTS "Service role can manage whatsapp_otp_analytics" ON whatsapp_otp_analytics;
CREATE POLICY "Service role can manage whatsapp_otp_analytics" ON whatsapp_otp_analytics
FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Contractors can view their own analytics" ON whatsapp_otp_analytics;
CREATE POLICY "Contractors can view their own analytics" ON whatsapp_otp_analytics
FOR SELECT USING (
  auth.role() = 'authenticated' AND
  contractor_id = auth.uid()
);

-- Step 10: Grant permissions for analytics table
GRANT ALL ON whatsapp_otp_analytics TO service_role;
GRANT USAGE ON SEQUENCE whatsapp_otp_analytics_id_seq TO service_role;

-- Step 11: Create cleanup function for expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM whatsapp_otps WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Verification: Check if tables were created successfully
SELECT 'whatsapp_otps table' as table_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'whatsapp_otps') 
            THEN 'Created Successfully ✓' 
            ELSE 'Failed to Create ❌' 
       END as status
UNION ALL
SELECT 'whatsapp_otp_analytics table' as table_name,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'whatsapp_otp_analytics') 
            THEN 'Created Successfully ✓' 
            ELSE 'Failed to Create ❌' 
       END as status
UNION ALL  
SELECT 'whatsapp_joined_numbers table' as table_name,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'whatsapp_joined_numbers') 
            THEN 'Created Successfully ✓' 
            ELSE 'Failed to Create ❌' 
       END as status;
