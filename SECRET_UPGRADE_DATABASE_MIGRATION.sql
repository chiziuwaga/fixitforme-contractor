-- REQUIRED SQL CHANGES FOR -felixscale SECRET UPGRADE SYSTEM
-- Run these in Supabase SQL Editor BEFORE GitHub deployment

-- 1. Add columns to contractor_profiles to support secret upgrade tracking
ALTER TABLE contractor_profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'growth' CHECK (subscription_tier IN ('growth', 'scale')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
ADD COLUMN IF NOT EXISTS tier_upgraded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS upgrade_method TEXT CHECK (upgrade_method IN ('secret_code_felixscale', 'stripe_subscription', 'admin_manual'));

-- 2. Update existing tier column to use subscription_tier (if you haven't already)
-- This migrates data from the old 'tier' column to the new 'subscription_tier' column
UPDATE contractor_profiles 
SET subscription_tier = tier 
WHERE subscription_tier IS NULL AND tier IS NOT NULL;

-- 3. Add analytics event types for secret upgrade tracking
-- Check if whatsapp_otp_analytics table exists and has proper event_type constraints
DO $$
BEGIN
    -- Add new event types to existing constraint if it exists
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

-- 4. Create index for efficient upgrade tracking queries
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_upgrade_method 
ON contractor_profiles(upgrade_method) 
WHERE upgrade_method IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contractor_profiles_subscription_tier 
ON contractor_profiles(subscription_tier);

-- 5. Update RLS policies to work with new subscription_tier column
-- No changes needed - existing policies work with the new column structure

-- 6. Verification queries - Run these to confirm changes worked
SELECT 
    'Secret upgrade columns added' as status,
    COUNT(*) as total_contractors,
    COUNT(CASE WHEN subscription_tier = 'scale' THEN 1 END) as scale_tier_contractors,
    COUNT(CASE WHEN upgrade_method = 'secret_code_felixscale' THEN 1 END) as secret_upgrade_contractors
FROM contractor_profiles;

-- Check if analytics table supports new event types
SELECT 
    'Analytics ready for secret upgrades' as status,
    COUNT(*) as total_events,
    COUNT(CASE WHEN event_type LIKE '%upgrade%' THEN 1 END) as upgrade_events
FROM whatsapp_otp_analytics;

-- 7. Test data integrity
SELECT 
    'Data integrity check' as status,
    COUNT(CASE WHEN subscription_tier NOT IN ('growth', 'scale') THEN 1 END) as invalid_tiers,
    COUNT(CASE WHEN subscription_status NOT IN ('active', 'inactive', 'cancelled') THEN 1 END) as invalid_statuses
FROM contractor_profiles;

SELECT 'Secret upgrade system database migration complete!' as final_status;
