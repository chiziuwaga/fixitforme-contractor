-- ✅ Phase 5B: Enhanced Chat Window Database Integration (CLEAN VERSION)
-- 🎯 Goals: Persistent chat state, message history, and UI asset generation tracking

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
CREATE POLICY chat_ui_assets_contractor_access ON chat_message_ui_assets
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
CREATE POLICY chat_typing_contractor_access ON chat_typing_indicators
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
CREATE POLICY chat_prompts_contractor_access ON chat_followup_prompts
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM contractor_profiles WHERE id = contractor_id
    )
  );

-- ✅ Phase 5B Tables Complete - Ready for Function Deployment
