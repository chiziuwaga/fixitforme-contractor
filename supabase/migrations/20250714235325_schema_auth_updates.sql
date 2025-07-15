-- Schema Update Script: Sync authentication changes from database linter fixes
-- IMPORTANT: This updates schema.sql to reflect the production authentication improvements

-- ============================================================================
-- 1. UPDATE RLS POLICIES FOR CONTRACTOR_PROFILES
-- ============================================================================

-- Drop old simple policies
DROP POLICY IF EXISTS "Contractors can view own profile" ON contractor_profiles;
DROP POLICY IF EXISTS "Contractors can update own profile" ON contractor_profiles;
DROP POLICY IF EXISTS "Contractors can insert own profile" ON contractor_profiles;

-- Create optimized, consolidated policies with efficient auth function calls
CREATE POLICY "contractor_profiles_select_policy" ON contractor_profiles
    FOR SELECT
    TO authenticated, anon
    USING (
        -- Use subquery to avoid re-evaluation per row (fixes auth_rls_initplan warning)
        user_id = (SELECT auth.uid()) 
        OR 
        (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
    );

CREATE POLICY "contractor_profiles_insert_policy" ON contractor_profiles
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (
        user_id = (SELECT auth.uid())
        OR 
        (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
    );

CREATE POLICY "contractor_profiles_update_policy" ON contractor_profiles
    FOR UPDATE
    TO authenticated, anon
    USING (
        user_id = (SELECT auth.uid())
        OR 
        (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
    )
    WITH CHECK (
        user_id = (SELECT auth.uid())
        OR 
        (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
    );

CREATE POLICY "contractor_profiles_delete_policy" ON contractor_profiles
    FOR DELETE
    TO authenticated, anon
    USING (
        user_id = (SELECT auth.uid())
        OR 
        (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
    );

-- ============================================================================
-- 2. ADD NEW AUTHENTICATION FUNCTIONS
-- ============================================================================

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS public.ensure_contractor_profile(uuid, text);
DROP FUNCTION IF EXISTS public.sync_phone_to_contractor_profile();
DROP FUNCTION IF EXISTS public.sync_phone_to_contractor_profile(uuid, text);

-- Create ensure_contractor_profile function with secure search_path
CREATE OR REPLACE FUNCTION public.ensure_contractor_profile(user_uuid uuid, phone_number text)
RETURNS TABLE(profile_id uuid, is_new boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    existing_profile_id uuid;
    new_profile_id uuid;
BEGIN
    -- Check for existing profile by user_id first
    SELECT id INTO existing_profile_id
    FROM contractor_profiles 
    WHERE user_id = user_uuid;
    
    IF existing_profile_id IS NOT NULL THEN
        RETURN QUERY SELECT existing_profile_id, false;
        RETURN;
    END IF;
    
    -- Check for existing profile by phone
    SELECT id INTO existing_profile_id
    FROM contractor_profiles 
    WHERE contact_phone = phone_number;
    
    IF existing_profile_id IS NOT NULL THEN
        -- Update existing profile with user_id using explicit timestamp
        UPDATE contractor_profiles 
        SET user_id = user_uuid,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = existing_profile_id;
        
        RETURN QUERY SELECT existing_profile_id, false;
        RETURN;
    END IF;
    
    -- Create new profile with explicit timestamp instead of NOW()
    INSERT INTO contractor_profiles (
        user_id,
        contact_phone,
        tier,
        created_at,
        updated_at
    ) VALUES (
        user_uuid,
        phone_number,
        'growth',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) RETURNING id INTO new_profile_id;
    
    RETURN QUERY SELECT new_profile_id, true;
END;
$$;

-- Create sync_phone_to_contractor_profile function with secure search_path  
-- Note: This function exists for completeness but cannot be used as a trigger on auth.users
CREATE OR REPLACE FUNCTION public.sync_phone_to_contractor_profile(user_uuid uuid, new_phone text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    -- Update contractor profile when phone changes (called from application)
    UPDATE contractor_profiles 
    SET contact_phone = new_phone,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = user_uuid;
END;
$$;

-- ============================================================================
-- 3. UPDATE EXISTING CLEANUP FUNCTION WITH SECURE SEARCH PATH
-- ============================================================================

-- Update cleanup_expired_otps function with secure search_path
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM whatsapp_otps WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$;

-- ============================================================================
-- 4. GRANT PROPER PERMISSIONS
-- ============================================================================

-- Grant necessary permissions to service role for functions
GRANT EXECUTE ON FUNCTION public.ensure_contractor_profile(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_phone_to_contractor_profile(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_otps() TO service_role;

-- Ensure service role can manage contractor profiles
GRANT ALL ON contractor_profiles TO service_role;
GRANT ALL ON whatsapp_otps TO service_role;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Schema auth updates complete' as status;