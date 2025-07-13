-- Simple database verification check
-- Run this in Supabase SQL Editor to verify tables exist

SELECT 
    table_name,
    CASE 
        WHEN table_name = 'materials' THEN '✅ Alex material research ready'
        WHEN table_name = 'agent_usage_tracking' THEN '✅ Analytics tracking ready'
        ELSE '✅ Table exists'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('materials', 'agent_usage_tracking')
ORDER BY table_name;

-- Quick count check
SELECT 
    'materials' as table_name,
    COUNT(*) as row_count,
    'Ready for Alex material research' as purpose
FROM materials
UNION ALL
SELECT 
    'agent_usage_tracking' as table_name,
    COUNT(*) as row_count,
    'Ready for AI analytics' as purpose
FROM agent_usage_tracking;
