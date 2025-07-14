-- ================================================================
-- FIX PHONE AUTHENTICATION CONSISTENCY
-- ================================================================
-- This script fixes the data inconsistency between auth.users and contractor_profiles
-- for phone-based authentication and ensures proper user lookup

-- Step 1: Add unique constraint on phone in contractor_profiles to prevent duplicates
ALTER TABLE contractor_profiles ADD CONSTRAINT unique_contact_phone UNIQUE (contact_phone);

-- Step 2: Create function to sync phone from auth.users to contractor_profiles
CREATE OR REPLACE FUNCTION sync_phone_to_contractor_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- When a contractor_profiles record is created, ensure contact_phone matches auth.users.phone
  IF NEW.user_id IS NOT NULL THEN
    UPDATE contractor_profiles 
    SET contact_phone = (
      SELECT phone FROM auth.users WHERE id = NEW.user_id
    )
    WHERE id = NEW.id AND NEW.contact_phone IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger to automatically sync phone numbers
DROP TRIGGER IF EXISTS sync_phone_trigger ON contractor_profiles;
CREATE TRIGGER sync_phone_trigger
  AFTER INSERT ON contractor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_phone_to_contractor_profile();

-- Step 4: Fix existing data - sync phone numbers from auth.users to contractor_profiles
UPDATE contractor_profiles 
SET contact_phone = auth.users.phone
FROM auth.users 
WHERE contractor_profiles.user_id = auth.users.id 
  AND (contractor_profiles.contact_phone IS NULL 
       OR contractor_profiles.contact_phone != auth.users.phone);

-- Step 5: Create index for efficient phone lookups
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_contact_phone 
  ON contractor_profiles(contact_phone);

-- Step 6: Create function to find or create contractor profile for authenticated user
CREATE OR REPLACE FUNCTION ensure_contractor_profile(input_phone TEXT, input_user_id UUID)
RETURNS UUID AS $$
DECLARE
  profile_id UUID;
  user_exists BOOLEAN := FALSE;
BEGIN
  -- Check if user exists in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = input_user_id) INTO user_exists;
  
  IF NOT user_exists THEN
    RAISE EXCEPTION 'User % does not exist in auth.users', input_user_id;
  END IF;

  -- Try to find existing contractor profile by user_id
  SELECT id INTO profile_id 
  FROM contractor_profiles 
  WHERE user_id = input_user_id;
  
  -- If not found by user_id, try by phone
  IF profile_id IS NULL THEN
    SELECT id INTO profile_id 
    FROM contractor_profiles 
    WHERE contact_phone = input_phone;
    
    -- If found by phone but different user_id, update the user_id
    IF profile_id IS NOT NULL THEN
      UPDATE contractor_profiles 
      SET user_id = input_user_id 
      WHERE id = profile_id;
    END IF;
  END IF;
  
  -- If still not found, create new profile
  IF profile_id IS NULL THEN
    INSERT INTO contractor_profiles (
      user_id, 
      contact_phone, 
      created_at, 
      updated_at
    ) VALUES (
      input_user_id, 
      input_phone, 
      NOW(), 
      NOW()
    ) RETURNING id INTO profile_id;
  END IF;
  
  RETURN profile_id;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Grant execute permission to service role
GRANT EXECUTE ON FUNCTION ensure_contractor_profile(TEXT, UUID) TO service_role;

-- Step 8: Create RLS policy to allow service role to manage profiles
CREATE POLICY "Service role can manage contractor profiles" ON contractor_profiles
  FOR ALL USING (auth.role() = 'service_role');
