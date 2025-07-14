-- Complete WhatsApp OTP Analytics Deployment Script
-- Run this in your Supabase SQL editor to enable full OTP analytics tracking

-- First, create the WhatsApp OTPs table if it doesn't exist
CREATE TABLE IF NOT EXISTS whatsapp_otps (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_phone_format CHECK (phone_number ~ '^\+[1-9]\d{1,14}$'),
  CONSTRAINT valid_otp_format CHECK (otp_code ~ '^\d{6}$')
);

-- Create index for efficient lookups on OTPs table
CREATE INDEX IF NOT EXISTS idx_whatsapp_otps_phone_expiry 
ON whatsapp_otps(phone_number, expires_at);

-- Enable RLS on OTPs table
ALTER TABLE whatsapp_otps ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for OTPs table (safe deployment)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'whatsapp_otps' 
    AND policyname = 'Service role can manage whatsapp_otps'
  ) THEN
    CREATE POLICY "Service role can manage whatsapp_otps" ON whatsapp_otps
    FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Grant permissions for OTPs table
GRANT ALL ON whatsapp_otps TO service_role;
GRANT USAGE ON SEQUENCE whatsapp_otps_id_seq TO service_role;

-- Now create the analytics table
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
  contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_phone_format_analytics CHECK (phone_number ~ '^\+[1-9]\d{1,14}$')
);

-- Create indexes for analytics table
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_phone ON whatsapp_otp_analytics(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_event ON whatsapp_otp_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_date ON whatsapp_otp_analytics(created_at);

-- Enable RLS on analytics table
ALTER TABLE whatsapp_otp_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics table (safe deployment)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'whatsapp_otp_analytics' 
    AND policyname = 'Service role can manage whatsapp_otp_analytics'
  ) THEN
    CREATE POLICY "Service role can manage whatsapp_otp_analytics" ON whatsapp_otp_analytics
    FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'whatsapp_otp_analytics' 
    AND policyname = 'Contractors can view their own analytics'
  ) THEN
    CREATE POLICY "Contractors can view their own analytics" ON whatsapp_otp_analytics
    FOR SELECT USING (
      auth.role() = 'authenticated' AND
      contractor_id = auth.uid()
    );
  END IF;
END $$;

-- Grant permissions for analytics table
GRANT ALL ON whatsapp_otp_analytics TO service_role;
GRANT USAGE ON SEQUENCE whatsapp_otp_analytics_id_seq TO service_role;

-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM whatsapp_otps WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a table to track WhatsApp joined numbers (optional enhancement)
CREATE TABLE IF NOT EXISTS whatsapp_joined_numbers (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  CONSTRAINT valid_phone_format_joined CHECK (phone_number ~ '^\+[1-9]\d{1,14}$')
);

-- Create index for joined numbers
CREATE INDEX IF NOT EXISTS idx_whatsapp_joined_phone ON whatsapp_joined_numbers(phone_number);

-- Enable RLS on joined numbers table
ALTER TABLE whatsapp_joined_numbers ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for joined numbers (safe deployment)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'whatsapp_joined_numbers' 
    AND policyname = 'Service role can manage whatsapp_joined_numbers'
  ) THEN
    CREATE POLICY "Service role can manage whatsapp_joined_numbers" ON whatsapp_joined_numbers
    FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Grant permissions for joined numbers table
GRANT ALL ON whatsapp_joined_numbers TO service_role;
GRANT USAGE ON SEQUENCE whatsapp_joined_numbers_id_seq TO service_role;

-- Verification queries
SELECT 'WhatsApp OTP Analytics deployment completed successfully!' as status;
SELECT 'Tables created: whatsapp_otps, whatsapp_otp_analytics, whatsapp_joined_numbers' as info;
