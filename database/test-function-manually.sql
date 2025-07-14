-- Test the ensure_contractor_profile function manually in Supabase SQL Editor
-- Copy and paste this into your Supabase SQL Editor to test

-- First, check if the function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'ensure_contractor_profile';

-- If function exists, test with a real user
-- Replace 'YOUR_ACTUAL_PHONE' and 'YOUR_ACTUAL_USER_ID' with real values from auth.users
-- SELECT * FROM ensure_contractor_profile('+13477646025', 'ACTUAL_USER_ID_FROM_AUTH_USERS');

-- Check existing users in auth.users (run this to get real user IDs)
-- This query may fail depending on RLS policies, which is expected
-- SELECT id, phone, created_at FROM auth.users WHERE phone IS NOT NULL LIMIT 5;
