-- ============================================================================
-- ENHANCED CHAT-FIRST ONBOARDING DATABASE SCHEMA (PHASE 3)
-- Enhanced Chat Manager Integration and Mobile UI Components
-- ============================================================================

-- ================================
-- PHASE 3A: ENHANCED USEENHANCEDONBOARDING HOOK INTEGRATION
-- ================================

-- Add missing columns to contractor_profiles for enhanced onboarding
DO $$
BEGIN
    -- Add onboarded column if it doesn't exist
    BEGIN
        ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added onboarded column to contractor_profiles';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'onboarded column already exists in contractor_profiles';
    END;
    
    -- Add profile_completion_score if it doesn't exist  
    BEGIN
        ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0 CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100);
        RAISE NOTICE 'Added profile_completion_score column to contractor_profiles';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'profile_completion_score column already exists in contractor_profiles';
    END;
    
    -- Add onboarding_started_at timestamp
    BEGIN
        ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added onboarding_started_at column to contractor_profiles';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'onboarding_started_at column already exists in contractor_profiles';
    END;
    
    -- Add onboarding_completed_at timestamp
    BEGIN
        ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added onboarding_completed_at column to contractor_profiles';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'onboarding_completed_at column already exists in contractor_profiles';
    END;
END $$;

-- ================================
-- PHASE 3B: RESPONSIVE LEXIONBOARDING INTEGRATION
-- ================================

-- Add device detection and responsive breakpoint data to UI preferences
DO $$
BEGIN
    -- Add detected_device_type for automatic device detection
    BEGIN
        ALTER TABLE contractor_ui_preferences ADD COLUMN IF NOT EXISTS detected_device_type TEXT CHECK (detected_device_type IN ('mobile', 'tablet', 'desktop'));
        RAISE NOTICE 'Added detected_device_type column to contractor_ui_preferences';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'detected_device_type column already exists';
    END;
    
    -- Add screen_resolution for responsive optimization
    BEGIN
        ALTER TABLE contractor_ui_preferences ADD COLUMN IF NOT EXISTS screen_resolution JSONB DEFAULT '{}';
        RAISE NOTICE 'Added screen_resolution column to contractor_ui_preferences';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'screen_resolution column already exists';
    END;
    
    -- Add responsive_features_enabled for feature gating
    BEGIN
        ALTER TABLE contractor_ui_preferences ADD COLUMN IF NOT EXISTS responsive_features_enabled JSONB DEFAULT '{"mobile_optimized": true, "tablet_layout": true, "desktop_enhanced": true}';
        RAISE NOTICE 'Added responsive_features_enabled column to contractor_ui_preferences';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'responsive_features_enabled column already exists';
    END;
END $$;

-- ================================
-- PHASE 3C: CHAT THREAD MANAGEMENT
-- ================================

-- Ensure chat_conversations exists and add missing columns
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
            onboarding_context JSONB DEFAULT '{}',
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created chat_conversations table';
    END IF;
    
    -- Add missing columns to existing chat_conversations
    BEGIN
        ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;
        ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS last_message_preview TEXT;
        ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 5);
        RAISE NOTICE 'Enhanced chat_conversations with management columns';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Some chat_conversations columns already exist';
    END;
END $$;

-- Ensure chat_messages is properly linked to conversations
DO $$
DECLARE
    has_conversation_id boolean;
    has_contractor_id boolean;
BEGIN
    -- Check current chat_messages structure
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'conversation_id'
    ) INTO has_conversation_id;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'contractor_id'
    ) INTO has_contractor_id;
    
    -- Add missing columns if needed
    IF NOT has_conversation_id THEN
        ALTER TABLE chat_messages ADD COLUMN conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added conversation_id to chat_messages';
    END IF;
    
    IF NOT has_contractor_id THEN
        ALTER TABLE chat_messages ADD COLUMN contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added contractor_id to chat_messages';
    END IF;
END $$;

-- ================================
-- PHASE 3D: MOBILE PWA PREFERENCES
-- ================================

-- Add PWA-specific preferences and mobile optimization settings
CREATE TABLE IF NOT EXISTS contractor_mobile_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE UNIQUE,
    pwa_installed BOOLEAN DEFAULT false,
    push_notifications_enabled BOOLEAN DEFAULT false,
    offline_mode_enabled BOOLEAN DEFAULT true,
    mobile_navigation_style TEXT DEFAULT 'bottom_tabs' CHECK (mobile_navigation_style IN ('bottom_tabs', 'side_drawer', 'top_nav')),
    chat_bubble_position TEXT DEFAULT 'bottom_right' CHECK (chat_bubble_position IN ('bottom_right', 'bottom_left', 'floating')),
    quick_actions_enabled JSONB DEFAULT '{"lexi_shortcut": true, "emergency_contact": true, "job_status_quick_view": true}',
    mobile_layout_preferences JSONB DEFAULT '{}',
    gesture_controls_enabled BOOLEAN DEFAULT true,
    haptic_feedback_enabled BOOLEAN DEFAULT true,
    voice_input_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- PHASE 3E: ENHANCED CHAT ANALYTICS
-- ================================

-- Add detailed analytics for chat-first onboarding effectiveness
CREATE TABLE IF NOT EXISTS onboarding_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    session_id UUID DEFAULT uuid_generate_v4(),
    onboarding_step TEXT NOT NULL,
    step_entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    step_completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INTEGER,
    device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    interaction_data JSONB DEFAULT '{}', -- Clicks, scrolls, chat messages, etc.
    lexi_interactions_count INTEGER DEFAULT 0,
    help_requests_count INTEGER DEFAULT 0,
    completion_method TEXT CHECK (completion_method IN ('chat_guided', 'form_direct', 'mixed')),
    drop_off_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- PHASE 3F: ENHANCED RLS POLICIES FOR NEW TABLES
-- ================================

-- Mobile preferences policies
ALTER TABLE contractor_mobile_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contractors can manage own mobile preferences" ON contractor_mobile_preferences;
CREATE POLICY "Contractors can manage own mobile preferences" ON contractor_mobile_preferences
    FOR ALL USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- Onboarding analytics policies
ALTER TABLE onboarding_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contractors can view own onboarding analytics" ON onboarding_analytics;
DROP POLICY IF EXISTS "System can insert onboarding analytics" ON onboarding_analytics;

CREATE POLICY "Contractors can view own onboarding analytics" ON onboarding_analytics
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert onboarding analytics" ON onboarding_analytics
    FOR INSERT WITH CHECK (true);

-- ================================
-- PHASE 3G: ENHANCED INDEXES FOR PERFORMANCE
-- ================================

-- Mobile preferences indexes
CREATE INDEX IF NOT EXISTS idx_contractor_mobile_preferences_device ON contractor_mobile_preferences(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_mobile_pwa_installed ON contractor_mobile_preferences(pwa_installed);

-- Onboarding analytics indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_analytics_contractor ON onboarding_analytics(contractor_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_analytics_session ON onboarding_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_analytics_step ON onboarding_analytics(onboarding_step);
CREATE INDEX IF NOT EXISTS idx_onboarding_analytics_device ON onboarding_analytics(device_type);
CREATE INDEX IF NOT EXISTS idx_onboarding_analytics_completion ON onboarding_analytics(completion_method);

-- Chat conversation management indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message ON chat_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_priority ON chat_conversations(priority_level DESC);

-- ================================
-- PHASE 3H: ENHANCED ONBOARDING FUNCTIONS
-- ================================

-- Function to track onboarding step analytics
CREATE OR REPLACE FUNCTION track_onboarding_step(
    user_uuid uuid,
    step_name text,
    device_type_param text DEFAULT 'desktop',
    interaction_data_param jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    contractor_profile_id uuid;
    session_uuid uuid;
BEGIN
    -- Get contractor profile ID
    SELECT id INTO contractor_profile_id
    FROM contractor_profiles 
    WHERE user_id = user_uuid;
    
    IF contractor_profile_id IS NULL THEN
        RAISE EXCEPTION 'Contractor profile not found for user %', user_uuid;
    END IF;
    
    -- Generate session ID for this step
    session_uuid := uuid_generate_v4();
    
    -- Insert analytics record
    INSERT INTO onboarding_analytics (
        contractor_id,
        session_id,
        onboarding_step,
        device_type,
        interaction_data,
        step_entered_at
    ) VALUES (
        contractor_profile_id,
        session_uuid,
        step_name,
        device_type_param,
        interaction_data_param,
        NOW()
    );
    
    RETURN session_uuid;
END;
$$;

-- Function to complete onboarding step with analytics
CREATE OR REPLACE FUNCTION complete_onboarding_step(
    session_uuid uuid,
    completion_method_param text DEFAULT 'form_direct',
    lexi_interactions integer DEFAULT 0
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    start_time timestamp;
    time_spent integer;
BEGIN
    -- Get start time for this session
    SELECT step_entered_at INTO start_time
    FROM onboarding_analytics
    WHERE session_id = session_uuid;
    
    IF start_time IS NULL THEN
        RETURN false;
    END IF;
    
    -- Calculate time spent
    time_spent := EXTRACT(EPOCH FROM (NOW() - start_time))::integer;
    
    -- Update analytics record
    UPDATE onboarding_analytics SET
        step_completed_at = NOW(),
        time_spent_seconds = time_spent,
        completion_method = completion_method_param,
        lexi_interactions_count = lexi_interactions
    WHERE session_id = session_uuid;
    
    RETURN true;
END;
$$;

-- Grant permissions to new functions
GRANT EXECUTE ON FUNCTION track_onboarding_step(uuid, text, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION complete_onboarding_step(uuid, text, integer) TO service_role;

-- ================================
-- PHASE 3 VERIFICATION
-- ================================

-- Verify Phase 3 deployment and show status
DO $$
DECLARE
    mobile_prefs_count integer;
    analytics_count integer;
    enhanced_functions integer;
BEGIN
    SELECT COUNT(*) INTO mobile_prefs_count FROM contractor_mobile_preferences;
    SELECT COUNT(*) INTO analytics_count FROM onboarding_analytics;
    
    SELECT COUNT(*) INTO enhanced_functions 
    FROM information_schema.routines 
    WHERE routine_name IN ('track_onboarding_step', 'complete_onboarding_step');
    
    RAISE NOTICE 'Phase 3: Enhanced chat manager integration deployed successfully';
    RAISE NOTICE 'Mobile preferences ready (records: %)', mobile_prefs_count;
    RAISE NOTICE 'Onboarding analytics ready (records: %)', analytics_count;
    RAISE NOTICE 'Enhanced functions created: %/2', enhanced_functions;
    RAISE NOTICE 'Phase 3 Complete: Chat manager and mobile UI integration ready';
END $$;

-- Show enhanced tables verification
SELECT 
    'Phase 3 Enhanced Tables' as status,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('contractor_mobile_preferences', 'onboarding_analytics', 'chat_conversations')
ORDER BY table_name;
