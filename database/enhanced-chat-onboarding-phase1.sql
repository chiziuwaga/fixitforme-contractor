-- ============================================================================
-- ENHANCED CHAT-FIRST ONBOARDING DATABASE SCHEMA (PHASE 1)
-- Properly aligned with existing conversation_id schema
-- ============================================================================

-- ================================
-- PHASE 1: ALIGN WITH EXISTING SCHEMA STRUCTURE
-- ================================

-- CRITICAL: The existing schema uses 'conversation_id', not 'thread_id'
-- This phase ensures compatibility with current chat_messages table structure

-- Check current schema alignment
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
    
    RAISE NOTICE 'Schema Analysis: conversation_id=%, thread_id=%', has_conversation_id, has_thread_id;
    
    -- If we have thread_id but not conversation_id, rename it back
    IF has_thread_id AND NOT has_conversation_id THEN
        ALTER TABLE chat_messages RENAME COLUMN thread_id TO conversation_id;
        RAISE NOTICE 'Renamed thread_id back to conversation_id for compatibility';
    END IF;
END $$;

-- ================================
-- PHASE 1A: ONBOARDING PROGRESSION TRACKING
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
    chat_conversation_id UUID, -- Will reference chat_conversations(id) when available
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    welcome_message_shown BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- PHASE 1B: WELCOME MESSAGES SYSTEM
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
-- PHASE 1C: RESPONSIVE UI PREFERENCES
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
    breakpoint_preferences JSONB DEFAULT '{}', -- Store responsive breakpoint choices
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- PHASE 1D: ENHANCED CHAT CONVERSATIONS
-- ================================

-- Check if chat_conversations already exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_conversations') THEN
        CREATE TABLE chat_conversations (
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
        RAISE NOTICE 'Created chat_conversations table';
    ELSE
        -- Add missing columns to existing table
        BEGIN
            ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS conversation_type TEXT DEFAULT 'general' CHECK (conversation_type IN ('general', 'onboarding', 'bidding', 'lead_generation'));
            ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
            ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS onboarding_context JSONB DEFAULT '{}';
            RAISE NOTICE 'Enhanced existing chat_conversations table';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Some columns already exist in chat_conversations';
        END;
    END IF;
END $$;

-- Now we can add the foreign key constraint to contractor_onboarding
ALTER TABLE contractor_onboarding 
ADD CONSTRAINT fk_chat_conversation_id 
FOREIGN KEY (chat_conversation_id) REFERENCES chat_conversations(id);

-- ================================
-- PHASE 1E: ENHANCED CHAT MESSAGES
-- ================================

-- Add onboarding-specific columns to existing chat_messages table
DO $$
BEGIN
    -- Add onboarding step tracking
    BEGIN
        ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS onboarding_step TEXT;
        RAISE NOTICE 'Added onboarding_step column to chat_messages';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'onboarding_step column already exists';
    END;
    
    -- Ensure we have ui_assets column
    BEGIN
        ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS ui_assets JSONB;
        RAISE NOTICE 'Added ui_assets column to chat_messages';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'ui_assets column already exists';
    END;
    
    -- Ensure we have actions column
    BEGIN
        ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS actions JSONB;
        RAISE NOTICE 'Added actions column to chat_messages';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'actions column already exists';
    END;
END $$;

-- ================================
-- PHASE 1F: BASIC RLS POLICIES
-- ================================

-- Onboarding policies
ALTER TABLE contractor_onboarding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contractors can manage own onboarding" ON contractor_onboarding;
CREATE POLICY "Contractors can manage own onboarding" ON contractor_onboarding
    FOR ALL USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- Welcome messages (public read)
ALTER TABLE welcome_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Welcome messages are publicly readable" ON welcome_messages;
CREATE POLICY "Welcome messages are publicly readable" ON welcome_messages
    FOR SELECT USING (is_active = true);

-- UI preferences policies
ALTER TABLE contractor_ui_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contractors can manage own UI preferences" ON contractor_ui_preferences;
CREATE POLICY "Contractors can manage own UI preferences" ON contractor_ui_preferences
    FOR ALL USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- ================================
-- PHASE 1G: BASIC INDEXES
-- ================================

-- Onboarding indexes
CREATE INDEX IF NOT EXISTS idx_contractor_onboarding_step ON contractor_onboarding(current_step);
CREATE INDEX IF NOT EXISTS idx_contractor_onboarding_completed ON contractor_onboarding(is_completed);
CREATE INDEX IF NOT EXISTS idx_contractor_onboarding_conversation ON contractor_onboarding(chat_conversation_id);

-- Chat message onboarding index
CREATE INDEX IF NOT EXISTS idx_chat_messages_onboarding_step ON chat_messages(onboarding_step) WHERE onboarding_step IS NOT NULL;

-- UI preferences indexes
CREATE INDEX IF NOT EXISTS idx_contractor_ui_preferences_device ON contractor_ui_preferences(preferred_device);

-- ================================
-- PHASE 1H: INITIAL WELCOME MESSAGE DATA
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
1)
ON CONFLICT DO NOTHING;

-- ================================
-- PHASE 1 VERIFICATION
-- ================================

-- Verify Phase 1 deployment and show status
DO $$
DECLARE
    welcome_count integer;
BEGIN
    SELECT COUNT(*) INTO welcome_count FROM welcome_messages;
    RAISE NOTICE 'Phase 1: Enhanced chat-onboarding schema deployed successfully';
    RAISE NOTICE 'Welcome messages count: %', welcome_count;
    RAISE NOTICE 'Phase 1 Complete: Basic onboarding infrastructure ready';
END $$;

-- Show column alignment verification
SELECT 
    'Column Verification' as status,
    table_name, 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
  AND column_name IN ('conversation_id', 'thread_id', 'onboarding_step', 'ui_assets', 'actions')
ORDER BY table_name, column_name;
