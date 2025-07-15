-- ============================================================================
-- ENHANCED CHAT-FIRST ONBOARDING DATABASE SCHEMA
-- Complete database foundation for multi-agent conversations with persistence
-- ============================================================================

-- ================================
-- CHAT CONVERSATIONS & THREADS
-- ================================

-- Enhanced chat conversations table for persistent multi-agent threads
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL CHECK (agent_type IN ('lexi', 'alex', 'rex')),
    conversation_type TEXT DEFAULT 'general' CHECK (conversation_type IN ('general', 'onboarding', 'bidding', 'lead_generation')),
    title TEXT NOT NULL,
    is_archived BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    onboarding_context JSONB DEFAULT '{}', -- Specific to onboarding conversations
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced chat messages with UI asset support and onboarding tracking
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    ui_assets JSONB, -- Structured UI components from agents
    actions JSONB, -- Interactive buttons and forms
    onboarding_step TEXT, -- Track onboarding progression
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- ONBOARDING PROGRESSION TRACKING
-- ================================

-- Enhanced onboarding tracking with chat integration
CREATE TABLE IF NOT EXISTS contractor_onboarding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE UNIQUE,
    current_step TEXT DEFAULT 'welcome' CHECK (current_step IN (
        'welcome', 'company_info', 'service_selection', 'service_areas', 
        'documents', 'preferences', 'complete'
    )),
    step_data JSONB DEFAULT '{}', -- Store step-specific data
    chat_conversation_id UUID REFERENCES chat_conversations(id), -- Link to onboarding chat
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    welcome_message_shown BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- AGENT INTERACTION ANALYTICS
-- ================================

-- Enhanced agent usage tracking with onboarding context
CREATE TABLE IF NOT EXISTS agent_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL CHECK (agent_type IN ('lexi', 'alex', 'rex')),
    conversation_id UUID REFERENCES chat_conversations(id),
    interaction_type TEXT NOT NULL CHECK (interaction_type IN (
        'chat_message', 'ui_asset_generated', 'action_taken', 'onboarding_step'
    )),
    context_data JSONB DEFAULT '{}',
    usage_date DATE DEFAULT CURRENT_DATE,
    session_duration INTERVAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- NUANCED WELCOME MESSAGES
-- ================================

-- Lexi's personalized welcome messages based on onboarding progress
CREATE TABLE IF NOT EXISTS welcome_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trigger_condition TEXT NOT NULL, -- 'profile_complete', 'first_visit', 'return_user', etc.
    message_template TEXT NOT NULL, -- Lexi's engaging message template
    ui_components JSONB, -- Associated UI assets
    priority INTEGER DEFAULT 1, -- Message priority for multiple triggers
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- RESPONSIVE STATE MANAGEMENT
-- ================================

-- Store device preferences and responsive states
CREATE TABLE IF NOT EXISTS contractor_ui_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE UNIQUE,
    preferred_device TEXT CHECK (preferred_device IN ('mobile', 'tablet', 'desktop')),
    chat_position TEXT DEFAULT 'right' CHECK (chat_position IN ('left', 'right', 'bottom')),
    chat_size TEXT DEFAULT 'normal' CHECK (chat_size IN ('compact', 'normal', 'expanded')),
    navigation_style TEXT DEFAULT 'bottom' CHECK (navigation_style IN ('top', 'bottom', 'sidebar')),
    theme_preference TEXT DEFAULT 'auto' CHECK (theme_preference IN ('light', 'dark', 'auto')),
    accessibility_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- ENHANCED RLS POLICIES
-- ================================

-- Chat conversations policies
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can manage own chat conversations" ON chat_conversations
    FOR ALL USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- Chat messages policies
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can manage own chat messages" ON chat_messages
    FOR ALL USING (
        conversation_id IN (
            SELECT id FROM chat_conversations WHERE contractor_id IN (
                SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Onboarding policies
ALTER TABLE contractor_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can manage own onboarding" ON contractor_onboarding
    FOR ALL USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- Agent interactions policies
ALTER TABLE agent_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view own agent interactions" ON agent_interactions
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert agent interactions" ON agent_interactions
    FOR INSERT WITH CHECK (true);

-- UI preferences policies
ALTER TABLE contractor_ui_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can manage own UI preferences" ON contractor_ui_preferences
    FOR ALL USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Chat conversation indexes
CREATE INDEX idx_chat_conversations_contractor_agent ON chat_conversations(contractor_id, agent_type);
CREATE INDEX idx_chat_conversations_type ON chat_conversations(conversation_type);
CREATE INDEX idx_chat_conversations_updated ON chat_conversations(updated_at DESC);

-- Chat message indexes
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_role ON chat_messages(role);
CREATE INDEX idx_chat_messages_onboarding_step ON chat_messages(onboarding_step);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);

-- Onboarding indexes
CREATE INDEX idx_contractor_onboarding_step ON contractor_onboarding(current_step);
CREATE INDEX idx_contractor_onboarding_completed ON contractor_onboarding(is_completed);

-- Agent interaction indexes
CREATE INDEX idx_agent_interactions_contractor_type ON agent_interactions(contractor_id, agent_type);
CREATE INDEX idx_agent_interactions_date ON agent_interactions(usage_date);
CREATE INDEX idx_agent_interactions_conversation ON agent_interactions(conversation_id);

-- ================================
-- FUNCTIONS FOR ONBOARDING FLOW
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION initialize_onboarding_chat(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION update_onboarding_progress(uuid, text, jsonb) TO service_role;

-- ================================
-- INITIAL WELCOME MESSAGE DATA
-- ================================

-- Insert Lexi's nuanced welcome messages
INSERT INTO welcome_messages (trigger_condition, message_template, ui_components, priority) VALUES
('first_visit', 
'Welcome to FixItForMe! 🎉 I''m Lexi, your personal contractor success guide. I''m here to help you set up your profile and start finding amazing projects. Ready to build something incredible together?',
'{"type": "onboarding_welcome", "data": {"steps": ["company_info", "services", "areas", "documents"], "estimated_time": "5 minutes"}}',
1),

('profile_incomplete',
'Welcome back! 👋 I see we started your onboarding but didn''t finish. No worries - let''s pick up where we left off. You''re just a few steps away from accessing premium leads!',
'{"type": "progress_continuation", "data": {"completed_steps": [], "remaining_steps": [], "progress_percentage": 0}}',
1),

('profile_complete',
'Welcome back to your FixItForMe dashboard! 🚀 Your profile looks great! Ready to dive into some new leads? I can help you find the perfect projects for your expertise.',
'{"type": "dashboard_welcome", "data": {"quick_actions": ["find_leads", "update_profile", "view_analytics"], "new_features": []}}',
1),

('return_user_with_activity',
'Hey there! 👋 Great to see you back! I''ve been keeping an eye on things while you were away. Let me catch you up on what''s been happening...',
'{"type": "activity_summary", "data": {"new_leads": 0, "messages": 0, "updates": []}}',
1);

-- ================================
-- VERIFICATION QUERIES
-- ================================

-- Verify schema deployment
SELECT 
    'Enhanced chat-onboarding schema deployed successfully' as status,
    COUNT(*) as welcome_messages_count
FROM welcome_messages;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('chat_conversations', 'chat_messages', 'contractor_onboarding');

-- Test functions
SELECT initialize_onboarding_chat('00000000-0000-0000-0000-000000000000'::uuid) as test_function_exists;
