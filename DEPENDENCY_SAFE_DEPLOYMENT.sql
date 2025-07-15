-- DEPENDENCY-AWARE DEPLOYMENT SCRIPT FOR SUPABASE SQL EDITOR
-- This script handles existing triggers and function dependencies properly

-- ============================================================================
-- SECTION 1: CHECK AND DROP EXISTING TRIGGERS FIRST
-- ============================================================================

-- Drop trigger first to avoid dependency conflicts
DROP TRIGGER IF EXISTS sync_phone_trigger ON contractor_profiles CASCADE;

-- Drop trigger function (if it exists with no parameters)
DROP FUNCTION IF EXISTS sync_phone_to_contractor_profile() CASCADE;

-- Drop other potential function signatures
DROP FUNCTION IF EXISTS public.sync_phone_to_contractor_profile() CASCADE;
DROP FUNCTION IF EXISTS public.sync_phone_to_contractor_profile(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.ensure_contractor_profile(uuid, text) CASCADE;

-- ============================================================================
-- SECTION 2: DROP EXISTING RLS POLICIES
-- ============================================================================

-- Drop old simple policies
DROP POLICY IF EXISTS "Contractors can view own profile" ON contractor_profiles;
DROP POLICY IF EXISTS "Contractors can update own profile" ON contractor_profiles;
DROP POLICY IF EXISTS "Contractors can insert own profile" ON contractor_profiles;

-- Drop any policies that might already exist from previous attempts
DROP POLICY IF EXISTS "contractor_profiles_select_policy" ON contractor_profiles;
DROP POLICY IF EXISTS "contractor_profiles_insert_policy" ON contractor_profiles;
DROP POLICY IF EXISTS "contractor_profiles_update_policy" ON contractor_profiles;
DROP POLICY IF EXISTS "contractor_profiles_delete_policy" ON contractor_profiles;

-- ============================================================================
-- SECTION 3: CREATE OPTIMIZED RLS POLICIES
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
-- SECTION 5: CREATE SYNC_PHONE FUNCTION (APPLICATION-CALLABLE, NOT TRIGGER)
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
-- SECTION 6: CREATE EXEC FUNCTION FOR DYNAMIC SQL EXECUTION
-- ============================================================================

-- Create exec function for dynamic SQL execution (useful for automation)
CREATE OR REPLACE FUNCTION public.exec(sql_query text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result text;
BEGIN
    -- Execute the SQL query
    EXECUTE sql_query;
    
    -- Return success message
    RETURN 'SQL executed successfully';
EXCEPTION
    WHEN OTHERS THEN
        -- Return error message
        RETURN 'Error: ' || SQLERRM;
END;
$$;

-- ============================================================================
-- SECTION 7: UPDATE CLEANUP FUNCTION
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
-- SECTION 8: GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions to service role for functions
GRANT EXECUTE ON FUNCTION public.ensure_contractor_profile(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_phone_to_contractor_profile(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_otps() TO service_role;
GRANT EXECUTE ON FUNCTION public.exec(text) TO service_role;

-- Grant necessary permissions for authenticated users (for RPC calls)
GRANT EXECUTE ON FUNCTION public.ensure_contractor_profile(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_phone_to_contractor_profile(uuid, text) TO authenticated;

-- Ensure service role can manage tables
GRANT ALL ON contractor_profiles TO service_role;
GRANT ALL ON whatsapp_otps TO service_role;

-- ============================================================================
-- SECTION 9: VERIFICATION QUERIES
-- ============================================================================

-- Check that functions were created successfully
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN ('ensure_contractor_profile', 'sync_phone_to_contractor_profile', 'exec', 'cleanup_expired_otps');

-- Check that policies were created successfully  
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'contractor_profiles';

-- Final verification
SELECT 
    'Schema authentication updates complete' as status,
    COUNT(*) as contractor_profiles_count
FROM contractor_profiles;
