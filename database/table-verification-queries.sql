-- FixItForMe Contractor - Table Verification Queries
-- Run these in your Supabase SQL Editor to check table status

-- 1. Check if core tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'contractor_profiles',
    'leads', 
    'materials',
    'agent_usage_tracking',
    'chat_conversations',
    'chat_messages',
    'felix_problems',
    'jobs',
    'bids'
  )
ORDER BY table_name;

-- 2. Check contractor_profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'contractor_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if new AgentQL columns exist in contractor_profiles
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contractor_profiles' 
      AND column_name = 'agentql_config'
  ) THEN 'EXISTS' ELSE 'MISSING' END as agentql_config_status,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contractor_profiles' 
      AND column_name = 'search_preferences'
  ) THEN 'EXISTS' ELSE 'MISSING' END as search_preferences_status,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contractor_profiles' 
      AND column_name = 'service_areas'
  ) THEN 'EXISTS' ELSE 'MISSING' END as service_areas_status;

-- 4. Check leads table structure (critical for Rex)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check materials table structure (critical for Alex)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'materials' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Check agent_usage_tracking table (critical for rate limiting)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'agent_usage_tracking' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Check if felix_problems table has data
SELECT 
  COUNT(*) as total_felix_problems,
  MIN(id) as min_id,
  MAX(id) as max_id
FROM felix_problems;

-- 8. Sample felix_problems data
SELECT id, title, category, urgency, avg_cost
FROM felix_problems 
ORDER BY id 
LIMIT 10;

-- 9. Check RLS policies are enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('leads', 'materials', 'agent_usage_tracking', 'chat_conversations', 'chat_messages');

-- 10. Check if custom functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN ('increment_agent_usage', 'get_daily_agent_usage', 'update_updated_at_column');

-- 11. Check indexes exist
SELECT 
  indexname,
  tablename
FROM pg_indexes 
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 12. Check sample data counts (if any contractors exist)
SELECT 
  'contractor_profiles' as table_name, COUNT(*) as row_count FROM contractor_profiles
UNION ALL
SELECT 'leads', COUNT(*) FROM leads
UNION ALL
SELECT 'materials', COUNT(*) FROM materials
UNION ALL
SELECT 'agent_usage_tracking', COUNT(*) FROM agent_usage_tracking
UNION ALL
SELECT 'chat_conversations', COUNT(*) FROM chat_conversations
UNION ALL
SELECT 'chat_messages', COUNT(*) FROM chat_messages;
