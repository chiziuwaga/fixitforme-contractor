-- Optional: Remove unused indexes to reduce database bloat
-- ONLY run this if you want to clean up unused indexes
-- WARNING: These indexes may become useful as data grows

-- Uncomment the lines below to remove unused indexes:

-- DROP INDEX IF EXISTS idx_jobs_location;
-- DROP INDEX IF EXISTS idx_service_areas_coordinates;
-- DROP INDEX IF EXISTS idx_contractor_profiles_user_id;
-- DROP INDEX IF EXISTS idx_leads_contractor_id;
-- DROP INDEX IF EXISTS idx_leads_status;
-- DROP INDEX IF EXISTS idx_bids_contractor_id;
-- DROP INDEX IF EXISTS idx_bids_job_id;
-- DROP INDEX IF EXISTS idx_notifications_contractor_id;
-- DROP INDEX IF EXISTS idx_notifications_read;
-- DROP INDEX IF EXISTS idx_chat_messages_contractor_id;
-- DROP INDEX IF EXISTS idx_chat_messages_session_id;
-- DROP INDEX IF EXISTS idx_agent_executions_contractor_id;
-- DROP INDEX IF EXISTS idx_agent_executions_status;
-- DROP INDEX IF EXISTS idx_materials_contractor_id;
-- DROP INDEX IF EXISTS idx_materials_project_id;
-- DROP INDEX IF EXISTS idx_materials_supplier;
-- DROP INDEX IF EXISTS idx_materials_created_at;
-- DROP INDEX IF EXISTS idx_agent_usage_contractor_id;
-- DROP INDEX IF EXISTS idx_agent_usage_agent_name;
-- DROP INDEX IF EXISTS idx_agent_usage_action_type;
-- DROP INDEX IF EXISTS idx_agent_usage_created_at;

-- Note: Keep these indexes for now - they'll be useful as your data grows
