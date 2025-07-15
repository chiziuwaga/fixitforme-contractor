-- ✅ ENHANCED CHAT THREAD MANAGEMENT FUNCTIONS
-- 🎯 Thread deletion and limit management for conversational agents

-- Function 1: Delete chat thread with all related data
CREATE OR REPLACE FUNCTION delete_chat_thread(
  thread_conversation_id UUID,
  contractor_uuid UUID
) RETURNS BOOLEAN AS $$
DECLARE
  thread_exists BOOLEAN;
  deleted_count INTEGER;
BEGIN
  -- Verify thread exists and belongs to contractor
  SELECT EXISTS(
    SELECT 1 FROM chat_conversations cc
    JOIN contractor_profiles cp ON cp.id = cc.contractor_id
    WHERE cc.id = thread_conversation_id 
    AND cp.id = contractor_uuid
    AND cp.user_id = auth.uid()
  ) INTO thread_exists;

  IF NOT thread_exists THEN
    RAISE EXCEPTION 'Chat thread not found or access denied';
  END IF;

  -- Delete follow-up prompts
  DELETE FROM chat_followup_prompts 
  WHERE message_id IN (
    SELECT id FROM chat_conversations 
    WHERE id = thread_conversation_id
  );
  
  -- Delete UI assets
  DELETE FROM chat_message_ui_assets 
  WHERE message_id IN (
    SELECT id FROM chat_conversations 
    WHERE id = thread_conversation_id
  );
  
  -- Delete typing indicators
  DELETE FROM chat_typing_indicators 
  WHERE conversation_id = thread_conversation_id;
  
  -- Delete all messages in the thread
  DELETE FROM chat_conversations 
  WHERE id = thread_conversation_id;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Clean up old threads when hitting limits
CREATE OR REPLACE FUNCTION cleanup_excess_chat_threads(
  contractor_uuid UUID,
  max_threads INTEGER DEFAULT 10
) RETURNS INTEGER AS $$
DECLARE
  cleanup_count INTEGER := 0;
  old_thread_id UUID;
  thread_cursor CURSOR FOR
    SELECT DISTINCT conversation_id
    FROM chat_conversations cc
    JOIN contractor_profiles cp ON cp.id = cc.contractor_id
    WHERE cp.id = contractor_uuid
    AND cp.user_id = auth.uid()
    ORDER BY MAX(cc.created_at) ASC
    LIMIT GREATEST(0, (
      SELECT COUNT(DISTINCT conversation_id) 
      FROM chat_conversations cc2
      JOIN contractor_profiles cp2 ON cp2.id = cc2.contractor_id
      WHERE cp2.id = contractor_uuid
    ) - max_threads);
BEGIN
  -- Delete oldest threads beyond limit
  FOR thread_record IN thread_cursor LOOP
    IF delete_chat_thread(thread_record.conversation_id, contractor_uuid) THEN
      cleanup_count := cleanup_count + 1;
    END IF;
  END LOOP;
  
  RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Get thread count for a contractor
CREATE OR REPLACE FUNCTION get_chat_thread_count(
  contractor_uuid UUID
) RETURNS INTEGER AS $$
DECLARE
  thread_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT conversation_id) INTO thread_count
  FROM chat_conversations cc
  JOIN contractor_profiles cp ON cp.id = cc.contractor_id
  WHERE cp.id = contractor_uuid
  AND cp.user_id = auth.uid();
  
  RETURN COALESCE(thread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 4: Get all threads for management (with metadata)
CREATE OR REPLACE FUNCTION get_chat_threads_with_metadata(
  contractor_uuid UUID,
  limit_param INTEGER DEFAULT 50
) RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'thread_id', conversation_id,
      'agent_type', agent_type,
      'message_count', message_count,
      'last_activity', last_activity,
      'first_message', first_message,
      'thread_title', CASE 
        WHEN agent_type = 'lexi' THEN 'Onboarding: ' || SUBSTRING(first_message, 1, 40)
        WHEN agent_type = 'alex' THEN 'Analysis: ' || SUBSTRING(first_message, 1, 40)  
        WHEN agent_type = 'rex' THEN 'Lead Gen: ' || SUBSTRING(first_message, 1, 40)
        ELSE 'Chat: ' || SUBSTRING(first_message, 1, 40)
      END,
      'can_delete', true
    ) ORDER BY last_activity DESC
  ) INTO result
  FROM (
    SELECT 
      cc.conversation_id,
      cc.agent_type,
      COUNT(cc.id) as message_count,
      MAX(cc.created_at) as last_activity,
      MIN(cc.message_content) as first_message
    FROM chat_conversations cc
    JOIN contractor_profiles cp ON cp.id = cc.contractor_id
    WHERE cp.id = contractor_uuid
    AND cp.user_id = auth.uid()
    GROUP BY cc.conversation_id, cc.agent_type
    ORDER BY last_activity DESC
    LIMIT limit_param
  ) thread_summary;

  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 5: Archive thread instead of delete (soft delete)
CREATE OR REPLACE FUNCTION archive_chat_thread(
  thread_conversation_id UUID,
  contractor_uuid UUID
) RETURNS BOOLEAN AS $$
DECLARE
  thread_exists BOOLEAN;
  updated_count INTEGER;
BEGIN
  -- Verify thread exists and belongs to contractor
  SELECT EXISTS(
    SELECT 1 FROM chat_conversations cc
    JOIN contractor_profiles cp ON cp.id = cc.contractor_id
    WHERE cc.id = thread_conversation_id 
    AND cp.id = contractor_uuid
    AND cp.user_id = auth.uid()
  ) INTO thread_exists;

  IF NOT thread_exists THEN
    RAISE EXCEPTION 'Chat thread not found or access denied';
  END IF;

  -- Add archived_at column if it doesn't exist
  BEGIN
    ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;

  -- Mark thread as archived
  UPDATE chat_conversations 
  SET archived_at = NOW()
  WHERE conversation_id = thread_conversation_id;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ✅ THREAD MANAGEMENT DEPLOYMENT COMPLETE
-- 📋 Functions ready for frontend integration with thread limits
-- 🎯 Supports both hard delete and soft archive patterns
