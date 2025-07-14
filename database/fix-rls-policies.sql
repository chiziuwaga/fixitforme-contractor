-- Enhanced RLS policies for phone authentication
-- Run this in Supabase SQL Editor

-- Allow service role to read auth.users for phone lookups
-- Note: This may not work depending on Supabase's auth schema permissions

-- Ensure service role can manage contractor profiles during authentication
DROP POLICY IF EXISTS "Service role can manage contractor profiles" ON contractor_profiles;
CREATE POLICY "Service role can manage contractor profiles" ON contractor_profiles
  FOR ALL USING (
    auth.role() = 'service_role' OR 
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to manage their own profiles  
DROP POLICY IF EXISTS "Users can manage own contractor profile" ON contractor_profiles;
CREATE POLICY "Users can manage own contractor profile" ON contractor_profiles
  FOR ALL USING (
    auth.uid() = user_id OR
    auth.role() = 'service_role'
  );

-- Ensure the function has proper permissions
GRANT ALL ON contractor_profiles TO service_role;
GRANT ALL ON contractor_profiles TO authenticated;

-- Test if we can query contractor_profiles
-- SELECT COUNT(*) FROM contractor_profiles;
