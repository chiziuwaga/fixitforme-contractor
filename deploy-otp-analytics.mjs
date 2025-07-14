// Deploy WhatsApp OTP Analytics Tables
// This script creates the missing tables needed for OTP analytics

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const CREATE_TABLES_SQL = `
-- Create WhatsApp OTPs table if it doesn't exist
CREATE TABLE IF NOT EXISTS whatsapp_otps (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_phone_format CHECK (phone_number ~ '^\\+[1-9]\\d{1,14}$'),
  CONSTRAINT valid_otp_format CHECK (otp_code ~ '^\\d{6}$')
);

-- Create index for efficient lookups on OTPs table
CREATE INDEX IF NOT EXISTS idx_whatsapp_otps_phone_expiry 
ON whatsapp_otps(phone_number, expires_at);

-- Enable RLS on OTPs table
ALTER TABLE whatsapp_otps ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for OTPs table
CREATE POLICY "Service role can manage whatsapp_otps" ON whatsapp_otps
FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions for OTPs table
GRANT ALL ON whatsapp_otps TO service_role;
GRANT USAGE ON SEQUENCE whatsapp_otps_id_seq TO service_role;

-- Create the analytics table
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
  CONSTRAINT valid_phone_format_analytics CHECK (phone_number ~ '^\\+[1-9]\\d{1,14}$')
);

-- Create indexes for analytics table
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_phone ON whatsapp_otp_analytics(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_event ON whatsapp_otp_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_date ON whatsapp_otp_analytics(created_at);

-- Enable RLS on analytics table
ALTER TABLE whatsapp_otp_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics table
CREATE POLICY "Service role can manage whatsapp_otp_analytics" ON whatsapp_otp_analytics
FOR ALL USING (auth.role() = 'service_role');

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
`

async function deployTables() {
  console.log('=== Deploying WhatsApp OTP Analytics Tables ===\n')
  
  try {
    console.log('Connecting to Supabase...')
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec', { sql: CREATE_TABLES_SQL })
    
    if (error) {
      console.error('❌ Error executing SQL:', error)
      return
    }
    
    console.log('✓ SQL executed successfully')
    
    // Verify tables were created
    const tables = ['whatsapp_otps', 'whatsapp_otp_analytics']
    
    for (const table of tables) {
      try {
        const { error: testError } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (testError) {
          console.log(`❌ Table '${table}' verification failed:`, testError.message)
        } else {
          console.log(`✓ Table '${table}' created and accessible`)
        }
      } catch (err) {
        console.log(`❌ Error verifying table '${table}':`, err.message)
      }
    }
    
    console.log('\n✅ WhatsApp OTP Analytics deployment complete!')
    
  } catch (err) {
    console.error('❌ Deployment failed:', err)
  }
}

deployTables()
