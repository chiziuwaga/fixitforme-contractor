-- Update WhatsApp OTP Analytics for Pure WhatsApp System
-- This adds secret upgrade support and removes any SMS references

-- 1. Update the event_type constraint to include secret upgrade events
DO $$ 
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'whatsapp_otp_analytics_event_type_check' 
    AND table_name = 'whatsapp_otp_analytics'
  ) THEN
    ALTER TABLE whatsapp_otp_analytics 
    DROP CONSTRAINT whatsapp_otp_analytics_event_type_check;
  END IF;
  
  -- Add updated constraint with secret upgrade events  
  ALTER TABLE whatsapp_otp_analytics 
  ADD CONSTRAINT whatsapp_otp_analytics_event_type_check 
  CHECK (event_type IN (
    'send_attempt', 'send_success', 'send_failure', 
    'verify_attempt', 'verify_success', 'verify_failure', 
    'expired', 'secret_upgrade_success', 'secret_upgrade_failure'
  ));
END $$;

-- 2. Ensure contractor_profiles table supports secret upgrades
-- Add subscription_tier column if missing
ALTER TABLE contractor_profiles 
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'growth';

-- Add upgrade tracking columns if missing  
ALTER TABLE contractor_profiles 
ADD COLUMN IF NOT EXISTS tier_upgraded_at TIMESTAMPTZ;

ALTER TABLE contractor_profiles 
ADD COLUMN IF NOT EXISTS upgrade_method VARCHAR(50);

-- 3. Create index for efficient upgrade tracking queries
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_upgrade_method 
ON contractor_profiles(upgrade_method) 
WHERE upgrade_method IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contractor_profiles_subscription_tier 
ON contractor_profiles(subscription_tier);

-- 4. Update constraint on contractor_profiles.tier to be compatible with subscription_tier
-- (Ensuring both tier and subscription_tier can coexist during transition)
DO $$
BEGIN
  -- Check if tier column exists and update constraint if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contractor_profiles' AND column_name = 'tier'
  ) THEN
    -- Update tier column to support new tiers
    ALTER TABLE contractor_profiles 
    ALTER COLUMN tier TYPE VARCHAR(20);
    
    -- No constraint update needed - tier is separate from subscription_tier
  END IF;
END $$;

-- 5. Verification queries
SELECT 'WhatsApp OTP Analytics updated for pure WhatsApp system' as status;

-- Check constraint was applied
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'whatsapp_otp_analytics_event_type_check';

-- Check contractor_profiles columns for secret upgrades
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'contractor_profiles' 
  AND column_name IN ('subscription_tier', 'tier_upgraded_at', 'upgrade_method')
ORDER BY column_name;

-- Show analytics event types now supported
SELECT 'Analytics now supports secret upgrade events: secret_upgrade_success, secret_upgrade_failure' as info;
