-- Enhanced Onboarding & Multi-Thread Chat Support
-- Migration to support responsive onboarding tracking and multi-agent chat threads

-- Add onboarding step tracking to contractor_profiles
ALTER TABLE contractor_profiles 
ADD COLUMN IF NOT EXISTS onboarding_steps_completed JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS onboarding_current_step VARCHAR(50) DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS device_preferences JSONB DEFAULT '{
  "preferred_device": "unknown",
  "screen_width": null,
  "last_mobile_session": null,
  "desktop_features_used": false
}'::jsonb,
ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ NULL;

-- Add indexes for efficient onboarding queries
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_onboarding_step 
ON contractor_profiles(onboarding_current_step);

CREATE INDEX IF NOT EXISTS idx_contractor_profiles_onboarding_completed 
ON contractor_profiles(onboarding_completed);

-- Create chat_threads table for multi-agent conversation tracking
CREATE TABLE IF NOT EXISTS chat_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    agent_type VARCHAR(20) NOT NULL CHECK (agent_type IN ('lexi', 'alex', 'rex')),
    thread_title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
    is_active BOOLEAN DEFAULT true,
    is_minimized BOOLEAN DEFAULT false,
    message_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb -- For storing agent-specific data
);

-- Add indexes for efficient chat thread queries
CREATE INDEX IF NOT EXISTS idx_chat_threads_contractor_agent 
ON chat_threads(contractor_id, agent_type);

CREATE INDEX IF NOT EXISTS idx_chat_threads_active 
ON chat_threads(contractor_id, is_active);

CREATE INDEX IF NOT EXISTS idx_chat_threads_last_message 
ON chat_threads(contractor_id, last_message_at DESC);

-- Enable RLS for chat_threads
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_threads (contractors can only access their own threads)
CREATE POLICY "chat_threads_select_policy" ON chat_threads
FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM contractor_profiles WHERE id = contractor_id)
);

CREATE POLICY "chat_threads_insert_policy" ON chat_threads
FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM contractor_profiles WHERE id = contractor_id)
);

CREATE POLICY "chat_threads_update_policy" ON chat_threads
FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM contractor_profiles WHERE id = contractor_id)
);

CREATE POLICY "chat_threads_delete_policy" ON chat_threads
FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM contractor_profiles WHERE id = contractor_id)
);

-- Create chat_messages table for storing individual messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    agent_type VARCHAR(20) CHECK (agent_type IN ('lexi', 'alex', 'rex')),
    ui_components JSONB, -- For storing generated UI component data
    execution_id VARCHAR(255), -- Link to concurrent execution manager
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add indexes for efficient message queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_time 
ON chat_messages(thread_id, created_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_execution 
ON chat_messages(execution_id) WHERE execution_id IS NOT NULL;

-- Enable RLS for chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_messages (inherit from thread access)
CREATE POLICY "chat_messages_select_policy" ON chat_messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM chat_threads ct 
        JOIN contractor_profiles cp ON ct.contractor_id = cp.id 
        WHERE ct.id = thread_id AND cp.user_id = auth.uid()
    )
);

CREATE POLICY "chat_messages_insert_policy" ON chat_messages
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM chat_threads ct 
        JOIN contractor_profiles cp ON ct.contractor_id = cp.id 
        WHERE ct.id = thread_id AND cp.user_id = auth.uid()
    )
);

-- Function to update thread last_message_at and message_count
CREATE OR REPLACE FUNCTION update_chat_thread_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE chat_threads 
    SET 
        last_message_at = NEW.created_at,
        message_count = (
            SELECT COUNT(*) FROM chat_messages 
            WHERE thread_id = NEW.thread_id
        ),
        updated_at = NOW()
    WHERE id = NEW.thread_id;
    
    RETURN NEW;
END;
$$;

-- Create trigger to automatically update thread stats
DROP TRIGGER IF EXISTS trigger_update_chat_thread_stats ON chat_messages;
CREATE TRIGGER trigger_update_chat_thread_stats
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_thread_stats();

-- Function to initialize default chat threads for new contractors
CREATE OR REPLACE FUNCTION initialize_contractor_chat_threads(contractor_profile_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Always create Lexi thread (available for all tiers)
    INSERT INTO chat_threads (contractor_id, agent_type, thread_title, is_active)
    VALUES (contractor_profile_id, 'lexi', 'Welcome Chat with Lexi', true);
    
    -- Create Scale tier threads if contractor has Scale tier
    IF EXISTS (
        SELECT 1 FROM contractor_profiles 
        WHERE id = contractor_profile_id AND tier = 'scale'
    ) THEN
        INSERT INTO chat_threads (contractor_id, agent_type, thread_title, is_active)
        VALUES 
            (contractor_profile_id, 'alex', 'Cost Analysis with Alex', false),
            (contractor_profile_id, 'rex', 'Lead Generation with Rex', false);
    END IF;
END;
$$;

-- Function to handle onboarding step progression
CREATE OR REPLACE FUNCTION update_onboarding_progress(
    contractor_profile_id UUID,
    completed_step VARCHAR(50),
    current_step VARCHAR(50) DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    steps_array JSONB;
BEGIN
    -- Get current completed steps
    SELECT onboarding_steps_completed INTO steps_array
    FROM contractor_profiles 
    WHERE id = contractor_profile_id;
    
    -- Initialize if null
    IF steps_array IS NULL THEN
        steps_array := '[]'::jsonb;
    END IF;
    
    -- Add completed step if not already present
    IF NOT (steps_array ? completed_step) THEN
        steps_array := steps_array || jsonb_build_array(completed_step);
    END IF;
    
    -- Update the profile
    UPDATE contractor_profiles 
    SET 
        onboarding_steps_completed = steps_array,
        onboarding_current_step = COALESCE(current_step, onboarding_current_step),
        onboarding_started_at = COALESCE(onboarding_started_at, NOW()),
        profile_score = LEAST(100, jsonb_array_length(steps_array) * 20), -- 5 steps = 100%
        updated_at = NOW()
    WHERE id = contractor_profile_id;
    
    -- Mark as completed if all major steps are done
    IF jsonb_array_length(steps_array) >= 5 THEN
        UPDATE contractor_profiles 
        SET 
            onboarding_completed = true,
            onboarding_completed_at = NOW(),
            onboarding_current_step = 'completed'
        WHERE id = contractor_profile_id;
    END IF;
END;
$$;

-- Create trigger to initialize chat threads for new contractors
CREATE OR REPLACE FUNCTION trigger_initialize_chat_threads()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Initialize chat threads for the new contractor
    PERFORM initialize_contractor_chat_threads(NEW.id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_contractor_chat_threads ON contractor_profiles;
CREATE TRIGGER trigger_contractor_chat_threads
    AFTER INSERT ON contractor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_initialize_chat_threads();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON chat_threads TO authenticated;
GRANT SELECT, INSERT ON chat_messages TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_device_prefs 
ON contractor_profiles USING GIN (device_preferences);

CREATE INDEX IF NOT EXISTS idx_chat_threads_metadata 
ON chat_threads USING GIN (metadata);

CREATE INDEX IF NOT EXISTS idx_chat_messages_ui_components 
ON chat_messages USING GIN (ui_components) WHERE ui_components IS NOT NULL;

-- Update existing contractors to have proper onboarding tracking
UPDATE contractor_profiles 
SET 
    onboarding_current_step = CASE 
        WHEN onboarding_completed = true THEN 'completed'
        ELSE 'welcome'
    END,
    onboarding_steps_completed = CASE 
        WHEN onboarding_completed = true THEN '["welcome", "business_profile", "services_selection", "documents_upload", "completion"]'::jsonb
        ELSE '[]'::jsonb
    END,
    profile_score = CASE 
        WHEN onboarding_completed = true THEN 100
        ELSE 20
    END
WHERE onboarding_steps_completed IS NULL;
