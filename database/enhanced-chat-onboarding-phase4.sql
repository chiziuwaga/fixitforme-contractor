-- ============================================================================
-- ENHANCED CHAT-FIRST ONBOARDING DATABASE SCHEMA (PHASE 4)
-- Frontend Integration and Enhanced Hook Support
-- ============================================================================

-- ================================
-- PHASE 4A: USEENHANCEDONBOARDING HOOK DATABASE INTEGRATION
-- ================================

-- Update useEnhancedOnboarding hook integration with database persistence
-- Add document management and website analysis support

CREATE TABLE IF NOT EXISTS contractor_documents_enhanced (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    onboarding_session_id UUID, -- Links to onboarding analytics session
    document_type TEXT NOT NULL CHECK (document_type IN (
        'business_license', 'insurance_certificate', 'certification', 
        'portfolio_image', 'reference_document', 'tax_document'
    )),
    file_name TEXT NOT NULL,
    file_size INTEGER,
    file_url TEXT NOT NULL,
    upload_source TEXT DEFAULT 'direct' CHECK (upload_source IN ('direct', 'website_analysis', 'chat_upload')),
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'needs_review')),
    verification_notes TEXT,
    ai_analysis_data JSONB, -- AI-extracted information from documents
    manual_review_required BOOLEAN DEFAULT false,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Website analysis results for contractor onboarding
CREATE TABLE IF NOT EXISTS contractor_website_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    website_url TEXT NOT NULL,
    analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'completed', 'failed', 'manual_review')),
    extracted_data JSONB DEFAULT '{}', -- Company info, services, contact details
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    ai_suggestions JSONB DEFAULT '{}', -- Suggested improvements or corrections
    manual_overrides JSONB DEFAULT '{}', -- User corrections to AI analysis
    analysis_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analysis_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- PHASE 4B: RESPONSIVE EMPTY STATES SUPPORT
-- ================================

-- Add responsive empty state tracking and optimization
CREATE TABLE IF NOT EXISTS empty_state_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    empty_state_type TEXT NOT NULL CHECK (empty_state_type IN (
        'pre_onboarding', 'dashboard_empty', 'leads_empty', 'bids_empty', 'documents_empty'
    )),
    device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    breakpoint_used TEXT, -- Actual breakpoint that was triggered
    interaction_type TEXT CHECK (interaction_type IN ('view', 'click', 'dismiss', 'action_taken')),
    lexi_message_shown BOOLEAN DEFAULT false,
    lexi_interaction_count INTEGER DEFAULT 0,
    action_taken TEXT, -- What action user took from empty state
    time_to_action_seconds INTEGER,
    session_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- PHASE 4C: ENHANCED CHAT WINDOW INTEGRATION
-- ================================

-- Add enhanced chat window state management for onboarding
CREATE TABLE IF NOT EXISTS chat_window_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    window_position JSONB DEFAULT '{"x": 100, "y": 100}',
    window_size JSONB DEFAULT '{"width": 400, "height": 600}',
    is_minimized BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    is_floating BOOLEAN DEFAULT true,
    z_index INTEGER DEFAULT 1000,
    device_optimized_settings JSONB DEFAULT '{}',
    last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_persistence_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- PHASE 4D: NAVIGATION FLOW OPTIMIZATION
-- ================================

-- Track page and modal navigation for optimization
CREATE TABLE IF NOT EXISTS navigation_flow_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    session_id UUID DEFAULT uuid_generate_v4(),
    from_page TEXT NOT NULL,
    to_page TEXT NOT NULL,
    navigation_type TEXT CHECK (navigation_type IN ('page_load', 'button_click', 'menu_selection', 'modal_open', 'modal_close', 'back_button')),
    device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    is_onboarding_flow BOOLEAN DEFAULT false,
    time_spent_on_previous_page_seconds INTEGER,
    lexi_was_active BOOLEAN DEFAULT false,
    user_action_before_navigation TEXT,
    navigation_context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- PHASE 4E: ENHANCED RLS POLICIES FOR FRONTEND INTEGRATION
-- ================================

-- Document management policies
ALTER TABLE contractor_documents_enhanced ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contractors can manage own enhanced documents" ON contractor_documents_enhanced;
CREATE POLICY "Contractors can manage own enhanced documents" ON contractor_documents_enhanced
    FOR ALL USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- Website analysis policies  
ALTER TABLE contractor_website_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contractors can manage own website analysis" ON contractor_website_analysis;
CREATE POLICY "Contractors can manage own website analysis" ON contractor_website_analysis
    FOR ALL USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- Empty state interactions policies
ALTER TABLE empty_state_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contractors can view own empty state interactions" ON empty_state_interactions;
DROP POLICY IF EXISTS "System can insert empty state interactions" ON empty_state_interactions;

CREATE POLICY "Contractors can view own empty state interactions" ON empty_state_interactions
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert empty state interactions" ON empty_state_interactions
    FOR INSERT WITH CHECK (true);

-- Chat window states policies
ALTER TABLE chat_window_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contractors can manage own chat window states" ON chat_window_states;
CREATE POLICY "Contractors can manage own chat window states" ON chat_window_states
    FOR ALL USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- Navigation flow analytics policies
ALTER TABLE navigation_flow_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contractors can view own navigation analytics" ON navigation_flow_analytics;
DROP POLICY IF EXISTS "System can insert navigation analytics" ON navigation_flow_analytics;

CREATE POLICY "Contractors can view own navigation analytics" ON navigation_flow_analytics
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert navigation analytics" ON navigation_flow_analytics
    FOR INSERT WITH CHECK (true);

-- ================================
-- PHASE 4F: PERFORMANCE INDEXES FOR FRONTEND
-- ================================

-- Document management indexes
CREATE INDEX IF NOT EXISTS idx_contractor_documents_enhanced_contractor ON contractor_documents_enhanced(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_documents_enhanced_type ON contractor_documents_enhanced(document_type);
CREATE INDEX IF NOT EXISTS idx_contractor_documents_enhanced_status ON contractor_documents_enhanced(verification_status);
CREATE INDEX IF NOT EXISTS idx_contractor_documents_enhanced_session ON contractor_documents_enhanced(onboarding_session_id);

-- Website analysis indexes
CREATE INDEX IF NOT EXISTS idx_contractor_website_analysis_contractor ON contractor_website_analysis(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_website_analysis_status ON contractor_website_analysis(analysis_status);
CREATE INDEX IF NOT EXISTS idx_contractor_website_analysis_url ON contractor_website_analysis(website_url);

-- Empty state interactions indexes
CREATE INDEX IF NOT EXISTS idx_empty_state_interactions_contractor ON empty_state_interactions(contractor_id);
CREATE INDEX IF NOT EXISTS idx_empty_state_interactions_type ON empty_state_interactions(empty_state_type);
CREATE INDEX IF NOT EXISTS idx_empty_state_interactions_device ON empty_state_interactions(device_type);

-- Chat window states indexes
CREATE INDEX IF NOT EXISTS idx_chat_window_states_contractor ON chat_window_states(contractor_id);
CREATE INDEX IF NOT EXISTS idx_chat_window_states_conversation ON chat_window_states(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_window_states_last_interaction ON chat_window_states(last_interaction_at DESC);

-- Navigation flow analytics indexes
CREATE INDEX IF NOT EXISTS idx_navigation_flow_analytics_contractor ON navigation_flow_analytics(contractor_id);
CREATE INDEX IF NOT EXISTS idx_navigation_flow_analytics_session ON navigation_flow_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_navigation_flow_analytics_onboarding ON navigation_flow_analytics(is_onboarding_flow);
CREATE INDEX IF NOT EXISTS idx_navigation_flow_analytics_device ON navigation_flow_analytics(device_type);

-- ================================
-- PHASE 4G: FRONTEND INTEGRATION FUNCTIONS
-- ================================

-- Function to initialize enhanced onboarding with full database integration
CREATE OR REPLACE FUNCTION initialize_enhanced_onboarding(
    user_uuid uuid,
    device_type_param text DEFAULT 'desktop',
    initial_data_param jsonb DEFAULT '{}'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    contractor_profile_id uuid;
    onboarding_conversation_id uuid;
    analytics_session_id uuid;
    mobile_prefs_id uuid;
    result jsonb;
BEGIN
    -- Get contractor profile ID
    SELECT id INTO contractor_profile_id
    FROM contractor_profiles 
    WHERE user_id = user_uuid;
    
    IF contractor_profile_id IS NULL THEN
        RAISE EXCEPTION 'Contractor profile not found for user %', user_uuid;
    END IF;
    
    -- Initialize onboarding conversation
    SELECT initialize_onboarding_chat(user_uuid) INTO onboarding_conversation_id;
    
    -- Start analytics tracking
    SELECT track_onboarding_step(user_uuid, 'initialization', device_type_param, initial_data_param) 
    INTO analytics_session_id;
    
    -- Create mobile preferences if on mobile/tablet
    IF device_type_param IN ('mobile', 'tablet') THEN
        INSERT INTO contractor_mobile_preferences (contractor_id)
        VALUES (contractor_profile_id)
        ON CONFLICT (contractor_id) DO NOTHING;
    END IF;
    
    -- Update contractor profile with onboarding start
    UPDATE contractor_profiles SET
        onboarding_started_at = COALESCE(onboarding_started_at, NOW()),
        updated_at = NOW()
    WHERE id = contractor_profile_id;
    
    -- Return initialization result
    result := jsonb_build_object(
        'contractor_id', contractor_profile_id,
        'conversation_id', onboarding_conversation_id,
        'analytics_session_id', analytics_session_id,
        'device_type', device_type_param,
        'initialized_at', NOW()
    );
    
    RETURN result;
END;
$$;

-- Function to track empty state interaction with responsive data
CREATE OR REPLACE FUNCTION track_empty_state_interaction(
    user_uuid uuid,
    empty_state_type_param text,
    device_type_param text,
    breakpoint_param text,
    interaction_type_param text,
    action_data_param jsonb DEFAULT '{}'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    contractor_profile_id uuid;
BEGIN
    -- Get contractor profile ID
    SELECT id INTO contractor_profile_id
    FROM contractor_profiles 
    WHERE user_id = user_uuid;
    
    IF contractor_profile_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Insert empty state interaction
    INSERT INTO empty_state_interactions (
        contractor_id,
        empty_state_type,
        device_type,
        breakpoint_used,
        interaction_type,
        action_taken,
        session_data
    ) VALUES (
        contractor_profile_id,
        empty_state_type_param,
        device_type_param,
        breakpoint_param,
        interaction_type_param,
        action_data_param->>'action_taken',
        action_data_param
    );
    
    RETURN true;
END;
$$;

-- Function to save chat window state
CREATE OR REPLACE FUNCTION save_chat_window_state(
    user_uuid uuid,
    conversation_id_param uuid,
    window_state_param jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    contractor_profile_id uuid;
BEGIN
    -- Get contractor profile ID
    SELECT id INTO contractor_profile_id
    FROM contractor_profiles 
    WHERE user_id = user_uuid;
    
    IF contractor_profile_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Insert or update chat window state
    INSERT INTO chat_window_states (
        contractor_id,
        conversation_id,
        window_position,
        window_size,
        is_minimized,
        is_pinned,
        is_floating,
        device_optimized_settings,
        last_interaction_at
    ) VALUES (
        contractor_profile_id,
        conversation_id_param,
        COALESCE(window_state_param->'position', '{"x": 100, "y": 100}'),
        COALESCE(window_state_param->'size', '{"width": 400, "height": 600}'),
        COALESCE((window_state_param->>'is_minimized')::boolean, false),
        COALESCE((window_state_param->>'is_pinned')::boolean, false),
        COALESCE((window_state_param->>'is_floating')::boolean, true),
        COALESCE(window_state_param->'device_settings', '{}'),
        NOW()
    ) ON CONFLICT (contractor_id, conversation_id) DO UPDATE SET
        window_position = EXCLUDED.window_position,
        window_size = EXCLUDED.window_size,
        is_minimized = EXCLUDED.is_minimized,
        is_pinned = EXCLUDED.is_pinned,
        is_floating = EXCLUDED.is_floating,
        device_optimized_settings = EXCLUDED.device_optimized_settings,
        last_interaction_at = NOW(),
        updated_at = NOW();
    
    RETURN true;
END;
$$;

-- Grant permissions to frontend integration functions
GRANT EXECUTE ON FUNCTION initialize_enhanced_onboarding(uuid, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION track_empty_state_interaction(uuid, text, text, text, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION save_chat_window_state(uuid, uuid, jsonb) TO service_role;

-- ================================
-- PHASE 4 VERIFICATION
-- ================================

-- Verify Phase 4 deployment and show status
DO $$
DECLARE
    docs_count integer;
    website_analysis_count integer;
    empty_states_count integer;
    chat_states_count integer;
    navigation_count integer;
    frontend_functions integer;
BEGIN
    SELECT COUNT(*) INTO docs_count FROM contractor_documents_enhanced;
    SELECT COUNT(*) INTO website_analysis_count FROM contractor_website_analysis;
    SELECT COUNT(*) INTO empty_states_count FROM empty_state_interactions;
    SELECT COUNT(*) INTO chat_states_count FROM chat_window_states;
    SELECT COUNT(*) INTO navigation_count FROM navigation_flow_analytics;
    
    SELECT COUNT(*) INTO frontend_functions 
    FROM information_schema.routines 
    WHERE routine_name IN ('initialize_enhanced_onboarding', 'track_empty_state_interaction', 'save_chat_window_state');
    
    RAISE NOTICE 'Phase 4: Frontend integration deployed successfully';
    RAISE NOTICE 'Enhanced documents ready (records: %)', docs_count;
    RAISE NOTICE 'Website analysis ready (records: %)', website_analysis_count;
    RAISE NOTICE 'Empty state tracking ready (records: %)', empty_states_count;
    RAISE NOTICE 'Chat window states ready (records: %)', chat_states_count;
    RAISE NOTICE 'Navigation analytics ready (records: %)', navigation_count;
    RAISE NOTICE 'Frontend functions created: %/3', frontend_functions;
    RAISE NOTICE 'Phase 4 Complete: Frontend integration and hook support ready';
END $$;

-- Show frontend integration tables verification
SELECT 
    'Phase 4 Frontend Tables' as status,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN (
    'contractor_documents_enhanced', 
    'contractor_website_analysis', 
    'empty_state_interactions',
    'chat_window_states',
    'navigation_flow_analytics'
)
ORDER BY table_name;
