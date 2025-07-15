-- MANUAL DEPLOYMENT SCRIPT FOR SUPABASE SQL EDITOR
-- Run this in the Supabase Dashboard > SQL Editor
-- IMPORTANT: Execute section by section to avoid transaction issues

-- ============================================================================
-- SECTION 1: UPDATE RLS POLICIES FOR CONTRACTOR_PROFILES
-- ============================================================================

-- Drop old simple policies (run this first)
DROP POLICY IF EXISTS "Contractors can view own profile" ON contractor_profiles;
DROP POLICY IF EXISTS "Contractors can update own profile" ON contractor_profiles;
DROP POLICY IF EXISTS "Contractors can insert own profile" ON contractor_profiles;

-- ============================================================================
-- SECTION 2: CREATE OPTIMIZED RLS POLICIES
-- ============================================================================

-- Create optimized SELECT policy (fixes auth_rls_initplan warning)
CREATE POLICY "contractor_profiles_select_policy" ON contractor_profiles
    FOR SELECT
    TO authenticated, anon
    USING (
        user_id = (SELECT auth.uid()) 
        OR 
        (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
    );

-- Create optimized INSERT policy  
CREATE POLICY "contractor_profiles_insert_policy" ON contractor_profiles
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (
        user_id = (SELECT auth.uid())
        OR 
        (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
    );

-- Create optimized UPDATE policy
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

-- Create optimized DELETE policy
CREATE POLICY "contractor_profiles_delete_policy" ON contractor_profiles
    FOR DELETE
    TO authenticated, anon
    USING (
        user_id = (SELECT auth.uid())
        OR 
        (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
    );

-- ============================================================================  
-- SECTION 3: UPDATE AUTHENTICATION FUNCTIONS
-- ============================================================================

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS public.ensure_contractor_profile(uuid, text);
DROP FUNCTION IF EXISTS public.sync_phone_to_contractor_profile();
DROP FUNCTION IF EXISTS public.sync_phone_to_contractor_profile(uuid, text);

-- ============================================================================
-- SECTION 4: CREATE ENSURE_CONTRACTOR_PROFILE FUNCTION
-- ============================================================================

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
        -- Update existing profile with user_id
        UPDATE contractor_profiles 
        SET user_id = user_uuid,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = existing_profile_id;
        
        RETURN QUERY SELECT existing_profile_id, false;
        RETURN;
    END IF;
    
    -- Create new profile
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

-- ============================================================================
-- SECTION 5: CREATE SYNC_PHONE FUNCTION  
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_phone_to_contractor_profile(user_uuid uuid, new_phone text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    UPDATE contractor_profiles 
    SET contact_phone = new_phone,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = user_uuid;
END;
$$;

-- ============================================================================
-- SECTION 6: UPDATE CLEANUP FUNCTION
-- ============================================================================

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
-- SECTION 7: GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.ensure_contractor_profile(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_phone_to_contractor_profile(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_otps() TO service_role;

-- Ensure service role can manage tables
GRANT ALL ON contractor_profiles TO service_role;
GRANT ALL ON whatsapp_otps TO service_role;

-- ============================================================================
-- VERIFICATION QUERY (run this last to confirm success)
-- ============================================================================

SELECT 
    'Schema authentication updates complete' as status,
    COUNT(*) as contractor_profiles_count
FROM contractor_profiles;
