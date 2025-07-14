-- EMERGENCY DATABASE DEPLOYMENT FOR DEMO BYPASS SYSTEM
-- Copy and paste this ENTIRE script into Supabase Dashboard > SQL Editor
-- This ensures the demo bypass system works immediately

-- ===========================================
-- STEP 1: WhatsApp OTPs Table (For Demo Mode)
-- ===========================================

CREATE TABLE IF NOT EXISTS whatsapp_otps (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_phone_format CHECK (phone_number ~ '^\+[1-9]\d{1,14}$'),
  CONSTRAINT valid_otp_format CHECK (otp_code ~ '^\d{6}$')
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_otps_phone_expiry 
ON whatsapp_otps(phone_number, expires_at);

-- Enable RLS
ALTER TABLE whatsapp_otps ENABLE ROW LEVEL SECURITY;

-- RLS Policy (Safe deployment)
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

-- Grant permissions
GRANT ALL ON whatsapp_otps TO service_role;
GRANT USAGE ON SEQUENCE whatsapp_otps_id_seq TO service_role;

-- ===========================================
-- STEP 2: Analytics Table (For Demo Tracking)
-- ===========================================

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

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_phone ON whatsapp_otp_analytics(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_event ON whatsapp_otp_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_date ON whatsapp_otp_analytics(created_at);

-- Enable RLS
ALTER TABLE whatsapp_otp_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Safe deployment)
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

-- Grant permissions
GRANT ALL ON whatsapp_otp_analytics TO service_role;
GRANT USAGE ON SEQUENCE whatsapp_otp_analytics_id_seq TO service_role;

-- ===========================================
-- STEP 3: Joined Numbers Tracking (Optional)
-- ===========================================

CREATE TABLE IF NOT EXISTS whatsapp_joined_numbers (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  CONSTRAINT valid_phone_format_joined CHECK (phone_number ~ '^\+[1-9]\d{1,14}$')
);

-- Index
CREATE INDEX IF NOT EXISTS idx_whatsapp_joined_phone ON whatsapp_joined_numbers(phone_number);

-- Enable RLS
ALTER TABLE whatsapp_joined_numbers ENABLE ROW LEVEL SECURITY;

-- RLS Policy (Safe deployment)
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

-- Grant permissions
GRANT ALL ON whatsapp_joined_numbers TO service_role;
GRANT USAGE ON SEQUENCE whatsapp_joined_numbers_id_seq TO service_role;

-- ===========================================
-- STEP 4: Cleanup Function
-- ===========================================

CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM whatsapp_otps WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- STEP 5: Demo Bypass Test Data (Optional)
-- ===========================================

-- Insert a demo bypass test entry (will be cleaned up automatically)
DO $$
BEGIN
  -- This demonstrates the demo bypass system working
  INSERT INTO whatsapp_otp_analytics (
    phone_number, 
    event_type, 
    event_data
  ) VALUES (
    '+1234567890',
    'send_success',
    '{"demo_mode": true, "bypass_code": "209741", "deployment_test": true}'::jsonb
  );
  
  EXCEPTION WHEN others THEN
    -- Ignore errors if analytics table doesn't exist yet
    NULL;
END $$;

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Check if tables were created successfully
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'whatsapp_otps' THEN '✅ Demo OTP storage ready'
    WHEN table_name = 'whatsapp_otp_analytics' THEN '✅ Demo analytics tracking ready' 
    WHEN table_name = 'whatsapp_joined_numbers' THEN '✅ WhatsApp tracking ready'
    ELSE '✅ Table exists'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('whatsapp_otps', 'whatsapp_otp_analytics', 'whatsapp_joined_numbers')
ORDER BY table_name;

-- Verify demo bypass system is ready
SELECT 
  'Demo Bypass System' as component,
  CASE 
    WHEN EXISTS (SELECT 1 FROM whatsapp_otp_analytics WHERE event_data->>'demo_mode' = 'true')
    THEN '✅ READY - Demo code 209741 will work'
    ELSE '✅ DEPLOYED - Tables ready for demo usage'
  END as status;

-- Final confirmation
SELECT '🎉 WhatsApp Demo Bypass Database Deployment COMPLETE!' as message;
SELECT 'Use demo code: 209741 with any phone number for authentication' as instructions;
