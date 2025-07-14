-- WhatsApp OTP Analytics Table - Migration Script
-- This table tracks detailed analytics about the OTP verification process

CREATE TABLE IF NOT EXISTS whatsapp_otp_analytics (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'send_attempt',      -- User requested OTP
      'send_success',      -- OTP successfully sent via WhatsApp
      'send_failure',      -- Failed to send OTP
      'verify_attempt',    -- User attempted to verify an OTP
      'verify_success',    -- OTP verification successful
      'verify_failure',    -- OTP verification failed
      'expired'            -- OTP expired without verification
    )
  ),
  event_data JSONB DEFAULT '{}',  -- Flexible data structure for event-specific details
  contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE SET NULL,  -- Link to contractor if authenticated
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Phone number validation consistent with existing tables
  CONSTRAINT valid_phone_format CHECK (phone_number ~ '^\+[1-9]\d{1,14}$')
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_phone ON whatsapp_otp_analytics(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_event ON whatsapp_otp_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_date ON whatsapp_otp_analytics(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE whatsapp_otp_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow service role to manage analytics
CREATE POLICY "Service role can manage whatsapp_otp_analytics" ON whatsapp_otp_analytics
FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated contractors to view only their own analytics
CREATE POLICY "Contractors can view their own analytics" ON whatsapp_otp_analytics
FOR SELECT USING (
  auth.role() = 'authenticated' AND
  contractor_id = auth.uid()
);

-- Grant permissions to service role
GRANT ALL ON whatsapp_otp_analytics TO service_role;
GRANT USAGE ON SEQUENCE whatsapp_otp_analytics_id_seq TO service_role;
