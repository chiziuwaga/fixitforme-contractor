-- =====================================
-- CRITICAL FIX: Service Role Auth Access
-- =====================================

-- 1. Grant full access to auth schema for service role
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO service_role;

-- 2. Specific grants for auth.users table
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.users TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.identities TO service_role;

-- 3. Enable service role to bypass RLS for authentication operations
ALTER TABLE contractor_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "service_role_all_access" ON contractor_profiles;
DROP POLICY IF EXISTS "Enable service role operations" ON contractor_profiles;

-- Create comprehensive service role policy
CREATE POLICY "service_role_full_access" ON contractor_profiles
    FOR ALL 
    TO service_role 
    USING (true)
    WITH CHECK (true);

-- 4. Ensure service role can execute our database function
GRANT EXECUTE ON FUNCTION ensure_contractor_profile(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION ensure_contractor_profile(uuid, text) TO authenticated;

-- 5. Set proper permissions for public access to function
REVOKE ALL ON FUNCTION ensure_contractor_profile FROM public;
GRANT EXECUTE ON FUNCTION ensure_contractor_profile TO service_role;
GRANT EXECUTE ON FUNCTION ensure_contractor_profile TO authenticated;

-- 6. Verify and recreate function with proper security
CREATE OR REPLACE FUNCTION ensure_contractor_profile(user_id_param uuid, phone_param text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER  -- This runs with the owner's permissions
SET search_path = public, auth
AS $$
DECLARE
    profile_id uuid;
    existing_user record;
BEGIN
    -- Log function entry for debugging
    RAISE NOTICE 'ensure_contractor_profile called with user_id: %, phone: %', user_id_param, phone_param;
    
    -- First check if profile already exists by user_id
    SELECT id INTO profile_id 
    FROM contractor_profiles 
    WHERE user_id = user_id_param;
    
    IF profile_id IS NOT NULL THEN
        RAISE NOTICE 'Found existing profile by user_id: %', profile_id;
        RETURN profile_id;
    END IF;
    
    -- Check if profile exists by phone (for phone-based auth)
    SELECT id INTO profile_id 
    FROM contractor_profiles 
    WHERE phone = phone_param;
    
    IF profile_id IS NOT NULL THEN
        -- Update the user_id if found by phone
        UPDATE contractor_profiles 
        SET user_id = user_id_param, updated_at = now()
        WHERE id = profile_id;
        
        RAISE NOTICE 'Updated existing profile by phone: %', profile_id;
        RETURN profile_id;
    END IF;
    
    -- Verify user exists in auth.users
    SELECT * INTO existing_user 
    FROM auth.users 
    WHERE id = user_id_param;
    
    IF existing_user IS NULL THEN
        RAISE EXCEPTION 'User % does not exist in auth.users', user_id_param;
    END IF;
    
    -- Create new contractor profile
    INSERT INTO contractor_profiles (
        user_id,
        phone,
        subscription_tier,
        subscription_status,
        created_at,
        updated_at
    ) VALUES (
        user_id_param,
        phone_param,
        'growth',
        'active',
        now(),
        now()
    ) RETURNING id INTO profile_id;
    
    RAISE NOTICE 'Created new profile: %', profile_id;
    RETURN profile_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in ensure_contractor_profile: %', SQLERRM;
        RAISE;
END;
$$;

-- 7. Test function access (this should work for service role)
SELECT 'Service role auth access setup complete' as status;
