-- ✅ Phase 5B: COMPLETE DEPLOYMENT SCRIPT
-- 🎯 Manual deployment for enhanced chat database integration
-- 📋 Run this entire script in your Supabase SQL editor

-- =============================================================================
-- PART 1: ENHANCED CHAT TABLES (Phase 5B)
-- =============================================================================

-- Step 1: Create chat UI assets table
CREATE TABLE IF NOT EXISTS chat_message_ui_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  asset_data JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contractor_id UUID NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE
);

-- Step 2: Create indexes for UI assets
CREATE INDEX IF NOT EXISTS idx_chat_ui_assets_message ON chat_message_ui_assets(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_ui_assets_contractor ON chat_message_ui_assets(contractor_id);
CREATE INDEX IF NOT EXISTS idx_chat_ui_assets_type ON chat_message_ui_assets(asset_type);

-- Step 3: Enable RLS for UI assets
ALTER TABLE chat_message_ui_assets ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policy for UI assets
CREATE POLICY IF NOT EXISTS chat_ui_assets_contractor_access ON chat_message_ui_assets
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM contractor_profiles WHERE id = contractor_id
    )
  );

-- Step 5: Create typing indicators table
CREATE TABLE IF NOT EXISTS chat_typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('lexi', 'alex', 'rex')),
  is_typing BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contractor_id UUID NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE,
  UNIQUE(conversation_id, agent_type)
);

-- Step 6: Enable RLS for typing indicators
ALTER TABLE chat_typing_indicators ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policy for typing indicators
CREATE POLICY IF NOT EXISTS chat_typing_contractor_access ON chat_typing_indicators
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM contractor_profiles WHERE id = contractor_id
    )
  );

-- Step 8: Create follow-up prompts table
CREATE TABLE IF NOT EXISTS chat_followup_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  prompt_order INTEGER NOT NULL DEFAULT 0,
  is_clicked BOOLEAN NOT NULL DEFAULT false,
  clicked_at TIMESTAMP WITH TIME ZONE,
  contractor_id UUID NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE
);

-- Step 9: Create indexes for follow-up prompts
CREATE INDEX IF NOT EXISTS idx_chat_prompts_message ON chat_followup_prompts(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_prompts_contractor ON chat_followup_prompts(contractor_id);

-- Step 10: Enable RLS for follow-up prompts
ALTER TABLE chat_followup_prompts ENABLE ROW LEVEL SECURITY;

-- Step 11: Create RLS policy for follow-up prompts
CREATE POLICY IF NOT EXISTS chat_prompts_contractor_access ON chat_followup_prompts
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM contractor_profiles WHERE id = contractor_id
    )
  );

-- =============================================================================
-- PART 2: ENHANCED CHAT FUNCTIONS (Phase 5B)
-- =============================================================================

-- Function 1: Save chat message with UI assets
CREATE OR REPLACE FUNCTION save_chat_message_with_assets(
  conversation_uuid UUID,
  message_content TEXT,
  message_role TEXT,
  agent_type_param TEXT DEFAULT NULL,
  ui_asset_type TEXT DEFAULT NULL,
  ui_asset_data JSONB DEFAULT '{}',
  followup_prompts TEXT[] DEFAULT ARRAY[]::TEXT[]
) RETURNS UUID AS $$
DECLARE
  contractor_uuid UUID;
  message_uuid UUID;
  prompt_text TEXT;
  prompt_idx INTEGER := 0;
BEGIN
  -- Get contractor ID from conversation
  SELECT cp.id INTO contractor_uuid
  FROM chat_conversations cc
  JOIN contractor_profiles cp ON cp.id = cc.contractor_id
  WHERE cc.id = conversation_uuid;

  IF contractor_uuid IS NULL THEN
    RAISE EXCEPTION 'Conversation not found or access denied';
  END IF;

  -- Insert chat message
  INSERT INTO chat_conversations (
    id, contractor_id, agent_type, message_content, message_role, created_at
  ) VALUES (
    gen_random_uuid(), contractor_uuid, agent_type_param, message_content, message_role, NOW()
  ) RETURNING id INTO message_uuid;

  -- Insert UI asset if provided
  IF ui_asset_type IS NOT NULL AND ui_asset_data IS NOT NULL THEN
    INSERT INTO chat_message_ui_assets (
      message_id, asset_type, asset_data, contractor_id
    ) VALUES (
      message_uuid, ui_asset_type, ui_asset_data, contractor_uuid
    );
  END IF;

  -- Insert follow-up prompts if provided
  IF array_length(followup_prompts, 1) > 0 THEN
    FOREACH prompt_text IN ARRAY followup_prompts LOOP
      INSERT INTO chat_followup_prompts (
        message_id, prompt_text, prompt_order, contractor_id
      ) VALUES (
        message_uuid, prompt_text, prompt_idx, contractor_uuid
      );
      prompt_idx := prompt_idx + 1;
    END LOOP;
  END IF;

  RETURN message_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Get enhanced chat history with UI assets
CREATE OR REPLACE FUNCTION get_enhanced_chat_history(
  conversation_uuid UUID,
  limit_param INTEGER DEFAULT 50
) RETURNS JSON AS $$
DECLARE
  contractor_uuid UUID;
  result JSON;
BEGIN
  -- Get contractor ID from conversation
  SELECT cp.id INTO contractor_uuid
  FROM chat_conversations cc
  JOIN contractor_profiles cp ON cp.id = cc.contractor_id
  WHERE cc.id = conversation_uuid
  LIMIT 1;

  IF contractor_uuid IS NULL THEN
    RAISE EXCEPTION 'Conversation not found or access denied';
  END IF;

  -- Build enhanced chat history with UI assets and follow-up prompts
  SELECT json_agg(
    json_build_object(
      'id', cc.id,
      'content', cc.message_content,
      'role', cc.message_role,
      'timestamp', cc.created_at,
      'agentType', cc.agent_type,
      'ui_assets', CASE 
        WHEN assets.asset_type IS NOT NULL THEN 
          json_build_object(
            'type', assets.asset_type,
            'data', assets.asset_data
          )
        ELSE NULL 
      END,
      'follow_up_prompts', prompts.prompt_list
    ) ORDER BY cc.created_at ASC
  ) INTO result
  FROM chat_conversations cc
  LEFT JOIN chat_message_ui_assets assets ON assets.message_id = cc.id
  LEFT JOIN (
    SELECT 
      cfp.message_id,
      array_agg(cfp.prompt_text ORDER BY cfp.prompt_order) as prompt_list
    FROM chat_followup_prompts cfp
    GROUP BY cfp.message_id
  ) prompts ON prompts.message_id = cc.id
  WHERE cc.contractor_id = contractor_uuid
  ORDER BY cc.created_at DESC
  LIMIT limit_param;

  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Update typing indicator
CREATE OR REPLACE FUNCTION update_typing_indicator(
  conversation_uuid UUID,
  agent_type_param TEXT,
  is_typing_param BOOLEAN
) RETURNS BOOLEAN AS $$
DECLARE
  contractor_uuid UUID;
BEGIN
  -- Get contractor ID from conversation
  SELECT cp.id INTO contractor_uuid
  FROM chat_conversations cc
  JOIN contractor_profiles cp ON cp.id = cc.contractor_id
  WHERE cc.id = conversation_uuid
  LIMIT 1;

  IF contractor_uuid IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Upsert typing indicator
  INSERT INTO chat_typing_indicators (
    conversation_id, agent_type, is_typing, contractor_id
  ) VALUES (
    conversation_uuid, agent_type_param, is_typing_param, contractor_uuid
  )
  ON CONFLICT (conversation_id, agent_type)
  DO UPDATE SET 
    is_typing = is_typing_param,
    started_at = CASE WHEN is_typing_param THEN NOW() ELSE started_at END;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- DEPLOYMENT VERIFICATION QUERIES
-- =============================================================================

-- Verify tables were created
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE tablename IN (
  'chat_message_ui_assets', 
  'chat_typing_indicators', 
  'chat_followup_prompts'
)
ORDER BY tablename;

-- Verify functions were created
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_name IN (
  'save_chat_message_with_assets',
  'get_enhanced_chat_history', 
  'update_typing_indicator'
)
ORDER BY routine_name;

-- Verify indexes were created
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename IN (
  'chat_message_ui_assets',
  'chat_typing_indicators', 
  'chat_followup_prompts'
)
ORDER BY tablename, indexname;

-- ✅ Phase 5B Complete Deployment Script
-- 📋 After running this script successfully, Phase 5B will be complete
-- 🚀 Ready to proceed with Phase 5C: ResponsiveLexiOnboarding Component
