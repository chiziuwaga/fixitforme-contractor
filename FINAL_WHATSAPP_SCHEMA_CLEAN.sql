-- FINAL WHATSAPP OTP SCHEMA COMPLETION - DEPENDENCY SAFE
-- This script handles the upgrade_candidates view dependency on contractor_profiles.tier
-- and completes the pure WhatsApp OTP system with secret upgrade functionality

-- ============================================================================
-- SECTION 1: DROP DEPENDENT VIEWS FIRST
-- ============================================================================

-- Drop the upgrade_candidates view that depends on contractor_profiles.tier
DROP VIEW IF EXISTS upgrade_candidates CASCADE;

-- Drop any other views that might depend on the tier column
DROP VIEW IF EXISTS demo_contractors CASCADE;
DROP VIEW IF EXISTS contractor_dashboard CASCADE;

-- ============================================================================
-- SECTION 2: ADD SECRET UPGRADE COLUMNS TO CONTRACTOR_PROFILES
-- ============================================================================

-- Add subscription_tier column (separate from 'tier' for backwards compatibility)
ALTER TABLE contractor_profiles 
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'growth';

-- Add upgrade tracking columns
ALTER TABLE contractor_profiles 
ADD COLUMN IF NOT EXISTS tier_upgraded_at TIMESTAMPTZ;

ALTER TABLE contractor_profiles 
ADD COLUMN IF NOT EXISTS upgrade_method VARCHAR(50);

-- Update subscription_tier constraint to support new tiers
DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'subscription_tier_check' 
    AND table_name = 'contractor_profiles'
  ) THEN
    ALTER TABLE contractor_profiles 
    ADD CONSTRAINT subscription_tier_check 
    CHECK (subscription_tier IN ('growth', 'scale'));
  END IF;
END $$;

-- Create indexes for efficient upgrade queries
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_subscription_tier 
ON contractor_profiles(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_contractor_profiles_upgrade_method 
ON contractor_profiles(upgrade_method) 
WHERE upgrade_method IS NOT NULL;

-- ============================================================================
-- SECTION 3: UPDATE EXISTING DATA
-- ============================================================================

-- Update existing contractor profiles to have consistent subscription_tier
UPDATE contractor_profiles 
SET subscription_tier = tier 
WHERE subscription_tier IS NULL OR subscription_tier = 'growth';

-- ============================================================================
-- SECTION 4: UPDATE WHATSAPP OTP ANALYTICS FOR SECRET UPGRADES
-- ============================================================================

-- Update the event_type constraint to include secret upgrade events
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

-- ============================================================================
-- SECTION 5: RECREATE VIEWS WITHOUT SECURITY DEFINER
-- ============================================================================

-- Recreate upgrade_candidates view using the new subscription_tier column
CREATE VIEW upgrade_candidates AS
SELECT 
    cp.id,
    cp.user_id,
    cp.contact_phone,
    cp.subscription_tier,
    cp.tier as legacy_tier,
    cp.created_at,
    cp.company_name
FROM contractor_profiles cp
WHERE cp.subscription_tier = 'growth'
    AND cp.created_at < (CURRENT_DATE - INTERVAL '30 days')
    AND EXISTS (
        SELECT 1 FROM bids 
        WHERE contractor_id = cp.id 
        AND created_at > (CURRENT_DATE - INTERVAL '30 days')
    );

-- Grant appropriate permissions
GRANT SELECT ON upgrade_candidates TO authenticated;
GRANT SELECT ON upgrade_candidates TO service_role;

-- Recreate contractor_dashboard view
CREATE VIEW contractor_dashboard AS
SELECT 
    cp.id,
    cp.user_id,
    cp.company_name,
    cp.subscription_tier,
    cp.tier as legacy_tier,
    'active' as subscription_status,
    COUNT(DISTINCT b.id) as total_bids,
    COUNT(DISTINCT l.id) as total_leads,
    COALESCE(SUM(CASE WHEN pt.status = 'succeeded' THEN pt.amount ELSE 0 END), 0) as total_earnings
FROM contractor_profiles cp
LEFT JOIN bids b ON b.contractor_id = cp.id
LEFT JOIN leads l ON l.contractor_id = cp.id
LEFT JOIN payment_transactions pt ON pt.contractor_id = cp.id
GROUP BY cp.id, cp.user_id, cp.company_name, cp.subscription_tier, cp.tier;

-- Grant appropriate permissions
GRANT SELECT ON contractor_dashboard TO authenticated;
GRANT SELECT ON contractor_dashboard TO service_role;

-- ============================================================================
-- SECTION 6: VERIFICATION QUERIES
-- ============================================================================

-- Check that secret upgrade columns were added successfully
SELECT 
    'Secret upgrade support added to contractor_profiles' as status,
    COUNT(*) as total_contractors,
    COUNT(CASE WHEN subscription_tier = 'scale' THEN 1 END) as scale_tier_contractors,
    COUNT(CASE WHEN upgrade_method = 'secret_code_felixscale' THEN 1 END) as secret_upgrade_contractors
FROM contractor_profiles;

-- Check constraint was applied to analytics
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'whatsapp_otp_analytics_event_type_check';

-- Show the final column structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'contractor_profiles' 
  AND column_name IN ('tier', 'subscription_tier', 'tier_upgraded_at', 'upgrade_method')
ORDER BY column_name;

-- Verify views were recreated successfully
SELECT 
    'Views recreated successfully' as status,
    COUNT(*) as upgrade_candidates_count
FROM upgrade_candidates;

-- Final success message
SELECT 'Pure WhatsApp OTP system with secret upgrades is now complete!' as final_status;
