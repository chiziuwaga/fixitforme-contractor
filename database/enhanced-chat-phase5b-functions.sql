-- ✅ Phase 5B: Enhanced Chat Functions (STEP 2)
-- 🎯 Goals: Database functions for frontend integration

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

-- ✅ Phase 5B Functions Complete - Ready for Frontend Integration
