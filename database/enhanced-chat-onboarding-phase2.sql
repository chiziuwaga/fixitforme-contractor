-- ============================================================================
-- ENHANCED CHAT-FIRST ONBOARDING DATABASE SCHEMA (PHASE 2)
-- Agent interaction analytics and onboarding functions
-- ============================================================================

-- ================================
-- PHASE 2A: AGENT INTERACTION ANALYTICS
-- ================================

-- Enhanced agent usage tracking with onboarding context
CREATE TABLE IF NOT EXISTS agent_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL CHECK (agent_type IN ('lexi', 'alex', 'rex')),
    conversation_id UUID, -- Will reference chat_conversations(id) when available
    interaction_type TEXT NOT NULL CHECK (interaction_type IN (
        'chat_message', 'ui_asset_generated', 'action_taken', 'onboarding_step'
    )),
    context_data JSONB DEFAULT '{}',
    usage_date DATE DEFAULT CURRENT_DATE,
    session_duration INTERVAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for conversation_id if chat_conversations exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_conversations') THEN
        BEGIN
            ALTER TABLE agent_interactions 
            ADD CONSTRAINT fk_agent_conversation_id 
            FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id);
            RAISE NOTICE 'Added conversation_id foreign key to agent_interactions';
        EXCEPTION
            WHEN duplicate_object THEN
                RAISE NOTICE 'Foreign key constraint already exists on agent_interactions';
        END;
    END IF;
END $$;

-- ================================
-- PHASE 2B: ENHANCED RLS POLICIES FOR NEW TABLES
-- ================================

-- Agent interactions policies
ALTER TABLE agent_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contractors can view own agent interactions" ON agent_interactions;
DROP POLICY IF EXISTS "System can insert agent interactions" ON agent_interactions;

CREATE POLICY "Contractors can view own agent interactions" ON agent_interactions
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert agent interactions" ON agent_interactions
    FOR INSERT WITH CHECK (true);

-- Enhanced chat conversations policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_conversations') THEN
        ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Contractors can manage own chat conversations" ON chat_conversations;
        CREATE POLICY "Contractors can manage own chat conversations" ON chat_conversations
            FOR ALL USING (
                contractor_id IN (
                    SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
                )
            );
        RAISE NOTICE 'Enhanced RLS policies for chat_conversations';
    END IF;
END $$;

-- Enhanced chat messages policies (check which foreign key column exists)
DO $$
DECLARE
    has_conversation_id boolean;
    has_thread_id boolean;
BEGIN
    -- Check which column exists in chat_messages
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'conversation_id'
    ) INTO has_conversation_id;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'thread_id'
    ) INTO has_thread_id;
    
    -- Create appropriate policy based on existing column
    ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Contractors can manage own chat messages" ON chat_messages;
    
    IF has_conversation_id THEN
        CREATE POLICY "Contractors can manage own chat messages" ON chat_messages
            FOR ALL USING (
                conversation_id IN (
                    SELECT id FROM chat_conversations WHERE contractor_id IN (
                        SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
                    )
                )
            );
        RAISE NOTICE 'Created RLS policy for chat_messages using conversation_id';
    ELSIF has_thread_id THEN
        CREATE POLICY "Contractors can manage own chat messages" ON chat_messages
            FOR ALL USING (
                thread_id IN (
                    SELECT id FROM chat_conversations WHERE contractor_id IN (
                        SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
                    )
                )
            );
        RAISE NOTICE 'Created RLS policy for chat_messages using thread_id';
    ELSE
        RAISE NOTICE 'No conversation reference column found in chat_messages';
    END IF;
END $$;

-- ================================
-- PHASE 2C: PERFORMANCE INDEXES
-- ================================

-- Chat conversation indexes (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_conversations') THEN
        CREATE INDEX IF NOT EXISTS idx_chat_conversations_contractor_agent ON chat_conversations(contractor_id, agent_type);
        CREATE INDEX IF NOT EXISTS idx_chat_conversations_type ON chat_conversations(conversation_type);
        CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated ON chat_conversations(updated_at DESC);
        RAISE NOTICE 'Created performance indexes for chat_conversations';
    END IF;
END $$;

-- Chat message indexes (skip role column as it doesn't exist in current schema)
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);

-- Create index on timestamp if it exists, otherwise on created_at
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'timestamp'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp DESC);
        RAISE NOTICE 'Created index on timestamp column';
    END IF;
END $$;

-- Agent interaction indexes
CREATE INDEX IF NOT EXISTS idx_agent_interactions_contractor_type ON agent_interactions(contractor_id, agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_interactions_date ON agent_interactions(usage_date);
CREATE INDEX IF NOT EXISTS idx_agent_interactions_conversation ON agent_interactions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agent_interactions_type ON agent_interactions(interaction_type);

-- ================================
-- PHASE 2D: ONBOARDING MANAGEMENT FUNCTIONS
-- ================================

-- Function to initialize onboarding chat conversation
CREATE OR REPLACE FUNCTION initialize_onboarding_chat(user_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    contractor_profile_id uuid;
    conversation_id uuid;
    onboarding_id uuid;
BEGIN
    -- Get contractor profile ID
    SELECT id INTO contractor_profile_id
    FROM contractor_profiles 
    WHERE user_id = user_uuid;
    
    IF contractor_profile_id IS NULL THEN
        RAISE EXCEPTION 'Contractor profile not found for user %', user_uuid;
    END IF;
    
    -- Check if onboarding conversation already exists
    SELECT chat_conversation_id INTO conversation_id
    FROM contractor_onboarding
    WHERE contractor_id = contractor_profile_id;
    
    IF conversation_id IS NOT NULL THEN
        RETURN conversation_id;
    END IF;
    
    -- Only create conversation if chat_conversations table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_conversations') THEN
        -- Create new onboarding conversation
        INSERT INTO chat_conversations (
            contractor_id,
            agent_type,
            conversation_type,
            title,
            is_pinned,
            onboarding_context
        ) VALUES (
            contractor_profile_id,
            'lexi',
            'onboarding',
            'Welcome to FixItForMe! 🎉',
            true,
            '{"step": "welcome", "progress": 0}'
        ) RETURNING id INTO conversation_id;
        
        -- Create or update onboarding record
        INSERT INTO contractor_onboarding (
            contractor_id,
            chat_conversation_id,
            current_step,
            step_data
        ) VALUES (
            contractor_profile_id,
            conversation_id,
            'welcome',
            '{}'
        ) ON CONFLICT (contractor_id) DO UPDATE SET
            chat_conversation_id = conversation_id,
            updated_at = NOW();
    ELSE
        -- Just create onboarding record without conversation link
        INSERT INTO contractor_onboarding (
            contractor_id,
            current_step,
            step_data
        ) VALUES (
            contractor_profile_id,
            'welcome',
            '{}'
        ) ON CONFLICT (contractor_id) DO UPDATE SET
            updated_at = NOW();
            
        -- Return a placeholder UUID
        conversation_id := uuid_generate_v4();
    END IF;
        
    RETURN conversation_id;
END;
$$;

-- Function to update onboarding progress
CREATE OR REPLACE FUNCTION update_onboarding_progress(
    user_uuid uuid,
    new_step text,
    step_data_json jsonb DEFAULT '{}'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    contractor_profile_id uuid;
    progress_percentage integer;
BEGIN
    -- Get contractor profile ID
    SELECT id INTO contractor_profile_id
    FROM contractor_profiles 
    WHERE user_id = user_uuid;
    
    IF contractor_profile_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Calculate progress percentage based on step
    progress_percentage := CASE new_step
        WHEN 'welcome' THEN 10
        WHEN 'company_info' THEN 25
        WHEN 'service_selection' THEN 45
        WHEN 'service_areas' THEN 65
        WHEN 'documents' THEN 80
        WHEN 'preferences' THEN 95
        WHEN 'complete' THEN 100
        ELSE 0
    END;
    
    -- Update onboarding record
    UPDATE contractor_onboarding SET
        current_step = new_step,
        step_data = step_data || step_data_json,
        completion_percentage = progress_percentage,
        is_completed = (new_step = 'complete'),
        completed_at = CASE WHEN new_step = 'complete' THEN NOW() ELSE completed_at END,
        updated_at = NOW()
    WHERE contractor_id = contractor_profile_id;
    
    -- Update contractor profile if onboarding is complete
    IF new_step = 'complete' THEN
        UPDATE contractor_profiles SET
            onboarded = true,
            updated_at = NOW()
        WHERE id = contractor_profile_id;
    END IF;
    
    RETURN true;
END;
$$;

-- Grant permissions to functions
GRANT EXECUTE ON FUNCTION initialize_onboarding_chat(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION update_onboarding_progress(uuid, text, jsonb) TO service_role;

-- ================================
-- PHASE 2 VERIFICATION
-- ================================

-- Verify Phase 2 deployment and show status
DO $$
DECLARE
    interactions_count integer;
    functions_count integer;
BEGIN
    SELECT COUNT(*) INTO interactions_count FROM agent_interactions;
    
    SELECT COUNT(*) INTO functions_count 
    FROM information_schema.routines 
    WHERE routine_name IN ('initialize_onboarding_chat', 'update_onboarding_progress');
    
    RAISE NOTICE 'Phase 2: Agent analytics and functions deployed successfully';
    RAISE NOTICE 'Agent interactions table ready (current records: %)', interactions_count;
    RAISE NOTICE 'Onboarding functions created: %/2', functions_count;
    RAISE NOTICE 'Phase 2 Complete: Agent analytics and onboarding functions ready';
END $$;

-- Show created tables verification
SELECT 
    'Phase 2 Tables' as status,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('agent_interactions', 'contractor_onboarding', 'welcome_messages', 'contractor_ui_preferences')
ORDER BY table_name;
