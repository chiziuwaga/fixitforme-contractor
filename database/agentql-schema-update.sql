-- FixItForMe Contractor Module - Supabase Schema Update
-- Production deployment script with AgentQL integration
-- Run this script on your Supabase instance to update tables

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Update contractor_profiles table for AgentQL integration
ALTER TABLE contractor_profiles 
ADD COLUMN IF NOT EXISTS agentql_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS search_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS service_areas TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}';

-- Create leads table for Rex lead generation
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    source TEXT NOT NULL CHECK (source IN ('craigslist', 'sams.gov', 'facebook', 'nextdoor', 'thumbtack', 'angies', 'homeadvisor')),
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
    estimated_value INTEGER DEFAULT 0,
    location TEXT,
    contact_info TEXT,
    posted_date TIMESTAMP WITH TIME ZONE,
    urgency TEXT CHECK (urgency IN ('low', 'medium', 'high')),
    direct_url TEXT,
    search_terms_matched TEXT[] DEFAULT '{}',
    felix_category INTEGER,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'bidding', 'won', 'lost', 'archived')),
    agentql_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create materials table for Alex material research
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    supplier TEXT NOT NULL CHECK (supplier IN ('home_depot', 'lowes', 'menards', 'ferguson', 'build_com', 'floor_decor', '84_lumber')),
    price_range TEXT,
    current_price DECIMAL(10,2),
    availability TEXT CHECK (availability IN ('in_stock', 'limited', 'order_required', 'out_of_stock')),
    location TEXT,
    product_url TEXT,
    delivery_available BOOLEAN DEFAULT false,
    delivery_cost DECIMAL(10,2),
    pickup_available BOOLEAN DEFAULT false,
    specifications JSONB DEFAULT '{}',
    agentql_data JSONB DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent_usage_tracking table for rate limiting
CREATE TABLE IF NOT EXISTS agent_usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL CHECK (agent_type IN ('lexi', 'alex', 'rex')),
    usage_date DATE DEFAULT CURRENT_DATE,
    usage_count INTEGER DEFAULT 1,
    tier TEXT CHECK (tier IN ('growth', 'scale')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(contractor_id, agent_type, usage_date)
);

-- Create chat_conversations table for persistent chats
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL CHECK (agent_type IN ('lexi', 'alex', 'rex')),
    title TEXT,
    is_archived BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table for conversation history
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    ui_assets JSONB,
    actions JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_contractor_id ON leads(contractor_id);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_quality_score ON leads(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_materials_contractor_id ON materials(contractor_id);
CREATE INDEX IF NOT EXISTS idx_materials_project_id ON materials(project_id);
CREATE INDEX IF NOT EXISTS idx_materials_supplier ON materials(supplier);

CREATE INDEX IF NOT EXISTS idx_agent_usage_contractor_date ON agent_usage_tracking(contractor_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_agent_usage_agent_type ON agent_usage_tracking(agent_type);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_contractor ON chat_conversations(contractor_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);

-- Row Level Security (RLS) policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads table
CREATE POLICY IF NOT EXISTS "Contractors can view their own leads" ON leads
    FOR SELECT USING (auth.uid() = contractor_id);

CREATE POLICY IF NOT EXISTS "Contractors can insert their own leads" ON leads
    FOR INSERT WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY IF NOT EXISTS "Contractors can update their own leads" ON leads
    FOR UPDATE USING (auth.uid() = contractor_id);

-- RLS Policies for materials table
CREATE POLICY IF NOT EXISTS "Contractors can view their own materials" ON materials
    FOR SELECT USING (auth.uid() = contractor_id);

CREATE POLICY IF NOT EXISTS "Contractors can insert their own materials" ON materials
    FOR INSERT WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY IF NOT EXISTS "Contractors can update their own materials" ON materials
    FOR UPDATE USING (auth.uid() = contractor_id);

-- RLS Policies for agent usage tracking
CREATE POLICY IF NOT EXISTS "Contractors can view their own usage" ON agent_usage_tracking
    FOR SELECT USING (auth.uid() = contractor_id);

CREATE POLICY IF NOT EXISTS "Contractors can insert their own usage" ON agent_usage_tracking
    FOR INSERT WITH CHECK (auth.uid() = contractor_id);

-- RLS Policies for chat conversations
CREATE POLICY IF NOT EXISTS "Contractors can view their own conversations" ON chat_conversations
    FOR SELECT USING (auth.uid() = contractor_id);

CREATE POLICY IF NOT EXISTS "Contractors can manage their own conversations" ON chat_conversations
    FOR ALL USING (auth.uid() = contractor_id);

-- RLS Policies for chat messages
CREATE POLICY IF NOT EXISTS "Contractors can view messages in their conversations" ON chat_messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM chat_conversations WHERE contractor_id = auth.uid()
        )
    );

CREATE POLICY IF NOT EXISTS "Contractors can insert messages in their conversations" ON chat_messages
    FOR INSERT WITH CHECK (
        conversation_id IN (
            SELECT id FROM chat_conversations WHERE contractor_id = auth.uid()
        )
    );

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER IF NOT EXISTS update_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_chat_conversations_updated_at 
    BEFORE UPDATE ON chat_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function for incrementing agent usage
CREATE OR REPLACE FUNCTION increment_agent_usage(
    p_contractor_id UUID,
    p_agent_type TEXT,
    p_tier TEXT
) RETURNS INTEGER AS $$
DECLARE
    current_count INTEGER;
BEGIN
    -- Insert or update usage count for today
    INSERT INTO agent_usage_tracking (contractor_id, agent_type, usage_date, tier, usage_count)
    VALUES (p_contractor_id, p_agent_type, CURRENT_DATE, p_tier, 1)
    ON CONFLICT (contractor_id, agent_type, usage_date)
    DO UPDATE SET usage_count = agent_usage_tracking.usage_count + 1;
    
    -- Return current count
    SELECT usage_count INTO current_count
    FROM agent_usage_tracking
    WHERE contractor_id = p_contractor_id 
      AND agent_type = p_agent_type 
      AND usage_date = CURRENT_DATE;
      
    RETURN COALESCE(current_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily usage for a contractor
CREATE OR REPLACE FUNCTION get_daily_agent_usage(p_contractor_id UUID)
RETURNS TABLE (
    agent_type TEXT,
    usage_count INTEGER,
    tier TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aut.agent_type,
        COALESCE(aut.usage_count, 0) as usage_count,
        aut.tier
    FROM agent_usage_tracking aut
    WHERE aut.contractor_id = p_contractor_id 
      AND aut.usage_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed Felix 40 problems data
INSERT INTO felix_problems (id, title, category, description, urgency, avg_cost, keywords) VALUES
(1, 'Toilet Running Constantly', 'plumbing', 'Toilet runs continuously, wasting water', 'medium', 150, ARRAY['toilet', 'running', 'water', 'flush']),
(2, 'Leaky Faucet', 'plumbing', 'Kitchen or bathroom faucet dripping', 'low', 100, ARRAY['faucet', 'leak', 'drip', 'water']),
(3, 'Electrical Outlet Not Working', 'electrical', 'Wall outlet has no power', 'medium', 120, ARRAY['outlet', 'electrical', 'power', 'GFCI']),
(4, 'Light Fixture Installation', 'electrical', 'Install new light fixture or ceiling fan', 'low', 200, ARRAY['light', 'fixture', 'ceiling', 'electrical']),
(5, 'Drywall Hole Repair', 'drywall', 'Patch holes in wall from pictures or damage', 'low', 80, ARRAY['drywall', 'hole', 'patch', 'wall'])
ON CONFLICT (id) DO NOTHING;

-- Create view for contractor dashboard metrics
CREATE OR REPLACE VIEW contractor_dashboard_metrics AS
SELECT 
    c.id as contractor_id,
    c.business_name,
    c.subscription_tier,
    COUNT(DISTINCT l.id) as total_leads,
    COUNT(DISTINCT CASE WHEN l.status = 'new' THEN l.id END) as new_leads,
    COUNT(DISTINCT CASE WHEN l.status = 'won' THEN l.id END) as won_leads,
    COALESCE(AVG(l.quality_score), 0) as avg_lead_quality,
    COUNT(DISTINCT j.id) as active_jobs,
    COUNT(DISTINCT b.id) as total_bids,
    COALESCE(SUM(CASE WHEN b.status = 'accepted' THEN b.amount END), 0) as total_won_amount
FROM contractor_profiles c
LEFT JOIN leads l ON c.id = l.contractor_id AND l.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN jobs j ON c.id = j.contractor_id AND j.status IN ('active', 'in_progress')
LEFT JOIN bids b ON c.id = b.contractor_id AND b.created_at >= NOW() - INTERVAL '30 days'
GROUP BY c.id, c.business_name, c.subscription_tier;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Refresh the view
REFRESH MATERIALIZED VIEW IF EXISTS contractor_dashboard_metrics;

COMMIT;
