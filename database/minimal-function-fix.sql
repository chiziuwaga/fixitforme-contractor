-- =====================================
-- SIMPLIFIED CRITICAL FIX: Core Function Only
-- =====================================

-- Create the missing ensure_contractor_profile function
CREATE OR REPLACE FUNCTION ensure_contractor_profile(user_id_param uuid, phone_param text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    profile_id uuid;
BEGIN
    -- Check if profile exists by user_id
    SELECT id INTO profile_id 
    FROM contractor_profiles 
    WHERE user_id = user_id_param;
    
    IF profile_id IS NOT NULL THEN
        RETURN profile_id;
    END IF;
    
    -- Check if profile exists by phone
    SELECT id INTO profile_id 
    FROM contractor_profiles 
    WHERE phone = phone_param;
    
    IF profile_id IS NOT NULL THEN
        -- Update the user_id
        UPDATE contractor_profiles 
        SET user_id = user_id_param, updated_at = now()
        WHERE id = profile_id;
        RETURN profile_id;
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
    
    RETURN profile_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;
