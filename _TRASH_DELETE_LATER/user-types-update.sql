-- Add user types to contractor_profiles table for demo/production distinction  
-- This supports the demo upgrade flow and login format specification

-- Add user_type column to contractor_profiles table
ALTER TABLE contractor_profiles 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'contractor' 
CHECK (user_type IN ('contractor', 'demo_contractor', 'test_contractor'));

-- Add subscription tier column if not exists (extending the existing tier column)
ALTER TABLE contractor_profiles 
DROP CONSTRAINT IF EXISTS contractor_profiles_tier_check;

ALTER TABLE contractor_profiles 
ADD CONSTRAINT contractor_profiles_tier_check 
CHECK (tier IN ('growth', 'scale', 'demo', 'test'));

-- Create index for efficient user type queries
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_user_type 
ON contractor_profiles(user_type);

-- Create index for subscription tier queries  
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_tier 
ON contractor_profiles(tier);

-- Update existing records to have proper user types
UPDATE contractor_profiles 
SET user_type = 'contractor'
WHERE user_type IS NULL;

-- Add demo mode tracking to analytics
ALTER TABLE whatsapp_otp_analytics 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(20);

ALTER TABLE whatsapp_otp_analytics 
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20);

-- Create view for demo users specifically
CREATE OR REPLACE VIEW demo_contractors AS
SELECT 
  id,
  contact_phone as phone,
  user_type,
  tier as subscription_tier,
  created_at,
  updated_at,
  'DEMO MODE - Limited Features' as status_message
FROM contractor_profiles 
WHERE user_type IN ('demo_contractor', 'test_contractor');

-- Create view for upgrade candidates  
CREATE OR REPLACE VIEW upgrade_candidates AS
SELECT 
  c.id,
  c.contact_phone as phone,
  c.user_type,
  c.tier as subscription_tier,
  c.created_at,
  COUNT(a.phone_number) as login_attempts,
  MAX(a.created_at) as last_login_attempt
FROM contractor_profiles c
LEFT JOIN whatsapp_otp_analytics a ON c.contact_phone = a.phone_number
WHERE c.user_type = 'demo_contractor' 
  AND c.tier = 'demo'
GROUP BY c.id, c.contact_phone, c.user_type, c.tier, c.created_at
HAVING COUNT(a.phone_number) >= 3 -- Users who have logged in 3+ times
ORDER BY last_login_attempt DESC;

COMMENT ON VIEW demo_contractors IS 'View of all demo contractors with limited feature access';
COMMENT ON VIEW upgrade_candidates IS 'Demo contractors who are candidates for upgrade prompts';
