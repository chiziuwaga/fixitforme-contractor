-- WhatsApp Tracking Table - Migration Script
-- This table tracks which phone numbers have successfully received WhatsApp messages
-- to avoid redundant sandbox join prompts for returning users

-- Tracking table for WhatsApp sandbox joined numbers
CREATE TABLE IF NOT EXISTS whatsapp_joined_numbers (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_success_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  CONSTRAINT valid_phone_format CHECK (phone_number ~ '^\+[1-9]\d{1,14}$')
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_joined_phone 
ON whatsapp_joined_numbers(phone_number);

-- Enable RLS (Row Level Security)
ALTER TABLE whatsapp_joined_numbers ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow service role to manage
CREATE POLICY "Service role can manage whatsapp_joined_numbers" ON whatsapp_joined_numbers
FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions to service role
GRANT ALL ON whatsapp_joined_numbers TO service_role;
GRANT USAGE ON SEQUENCE whatsapp_joined_numbers_id_seq TO service_role;

-- Create trigger to update message_count and last_success_at when a record is updated
CREATE OR REPLACE FUNCTION update_whatsapp_joined_numbers()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.message_count IS NOT NULL THEN
    NEW.message_count := OLD.message_count + 1;
  END IF;
  NEW.last_success_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger on update
DROP TRIGGER IF EXISTS update_whatsapp_message_count ON whatsapp_joined_numbers;
CREATE TRIGGER update_whatsapp_message_count
BEFORE UPDATE ON whatsapp_joined_numbers
FOR EACH ROW
EXECUTE FUNCTION update_whatsapp_joined_numbers();
