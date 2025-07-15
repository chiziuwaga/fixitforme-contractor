-- FINAL WHATSAPP OTP SCHEMA COMPLETION
-- Add secret upgrade support to contractor_profiles table
-- This completes the pure WhatsApp OTP system with secret upgrade functionality

-- Add subscription_tier column (separate from 'tier' for backwards compatibility)
ALTER TABLE contractor_profiles 
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'growth';

-- Add upgrade tracking columns
ALTER TABLE contractor_profiles 
ADD COLUMN IF NOT EXISTS tier_upgraded_at TIMESTAMPTZ;

ALTER TABLE contractor_profiles 
ADD COLUMN IF NOT EXISTS upgrade_method VARCHAR(50);

-- Update subscription_tier constraint to support new tiers
ALTER TABLE contractor_profiles 
ADD CONSTRAINT IF NOT EXISTS subscription_tier_check 
CHECK (subscription_tier IN ('growth', 'scale'));

-- Create indexes for efficient upgrade queries
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_subscription_tier 
ON contractor_profiles(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_contractor_profiles_upgrade_method 
ON contractor_profiles(upgrade_method) 
WHERE upgrade_method IS NOT NULL;

-- Update existing contractor profiles to have consistent subscription_tier
UPDATE contractor_profiles 
SET subscription_tier = tier 
WHERE subscription_tier IS NULL OR subscription_tier = 'growth';

-- Verification query
SELECT 'Secret upgrade support added to contractor_profiles' as status;

-- Show the final structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'contractor_profiles' 
  AND column_name IN ('tier', 'subscription_tier', 'tier_upgraded_at', 'upgrade_method')
ORDER BY column_name;
