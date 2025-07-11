-- Deploy this complete schema to your Supabase instance
-- Go to Supabase Dashboard > SQL Editor and run this script

-- FixItForMe Contractor Module Database Schema
-- Based on Custom_Instructions_Contractor_FixItForMe.md specifications

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geographic queries

-- ================================
-- CONTRACTOR PROFILES
-- ================================
CREATE TABLE contractor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    contact_phone VARCHAR(20),
    business_license VARCHAR(100),
    service_areas JSONB, -- Geographic areas they serve
    services_offered JSONB, -- Felix 40-problem IDs they handle
    tier VARCHAR(20) DEFAULT 'growth' CHECK (tier IN ('growth', 'scale')),
    stripe_customer_id VARCHAR(255),
    rex_search_usage INTEGER DEFAULT 0,
    max_bids_per_month INTEGER DEFAULT 10,
    current_bids_this_month INTEGER DEFAULT 0,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    profile_score INTEGER DEFAULT 0, -- Completion percentage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for contractor_profiles
ALTER TABLE contractor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view own profile" ON contractor_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Contractors can update own profile" ON contractor_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Contractors can insert own profile" ON contractor_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================
-- CONTRACTOR DOCUMENTS
-- ================================
CREATE TABLE contractor_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- license, insurance, certification
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for contractor_documents
ALTER TABLE contractor_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can manage own documents" ON contractor_documents
    FOR ALL USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- ================================
-- SUBSCRIPTIONS
-- ================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('growth', 'scale')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    monthly_fee DECIMAL(10,2) DEFAULT 0.00,
    transaction_fee_percentage DECIMAL(5,2) DEFAULT 10.00,
    max_bids_per_month INTEGER DEFAULT 10,
    features JSONB, -- Tier-specific features
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view own subscription" ON subscriptions
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- ================================
-- JOBS
-- ================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    homeowner_id UUID, -- Will reference homeowner system later
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    felix_problem_ids JSONB, -- Array of Felix 40-problem IDs
    location_address TEXT,
    location_coordinates POINT, -- PostGIS point for geographic queries
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'emergency')),
    status VARCHAR(20) DEFAULT 'posted' CHECK (status IN ('posted', 'in_progress', 'completed', 'cancelled')),
    images JSONB, -- Array of image URLs
    requirements JSONB, -- Specific requirements
    timeline VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- LEADS (Generated for contractors)
-- ================================
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    match_score INTEGER DEFAULT 0, -- 0-100 compatibility score
    generated_by VARCHAR(20) DEFAULT 'rex' CHECK (generated_by IN ('rex', 'manual', 'referral')),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'contacted', 'quoted', 'won', 'lost')),
    rex_research_data JSONB, -- Data from Rex's lead generation
    distance_miles DECIMAL(6,2), -- Distance from contractor to job
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view own leads" ON leads
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- ================================
-- BIDS
-- ================================
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    timeline VARCHAR(100),
    message TEXT,
    materials_cost DECIMAL(10,2),
    labor_cost DECIMAL(10,2),
    markup_percentage DECIMAL(5,2),
    alex_assistance_data JSONB, -- Data from Alex's bid assistance
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for bids
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can manage own bids" ON bids
    FOR ALL USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- ================================
-- FELIX 40-PROBLEM REFERENCE
-- ================================
CREATE TABLE felix_problems (
    id INTEGER PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    problem_name VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    avg_cost_min DECIMAL(10,2),
    avg_cost_max DECIMAL(10,2),
    typical_timeline VARCHAR(100),
    required_materials JSONB,
    common_tools JSONB,
    safety_considerations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- COMMON SERVICE AREAS
-- ================================
CREATE TABLE service_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- city, county, zip_code, metro_area
    state VARCHAR(2) NOT NULL,
    coordinates POINT, -- Geographic center point
    boundary POLYGON, -- Service area boundary (if available)
    population INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- CONTRACTOR ANALYTICS
-- ================================
CREATE TABLE contractor_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    leads_received INTEGER DEFAULT 0,
    leads_viewed INTEGER DEFAULT 0,
    bids_submitted INTEGER DEFAULT 0,
    bids_won INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    rex_searches_used INTEGER DEFAULT 0,
    alex_assistance_used INTEGER DEFAULT 0,
    lexi_interactions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(contractor_id, date)
);

-- RLS for contractor_analytics
ALTER TABLE contractor_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view own analytics" ON contractor_analytics
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- ================================
-- NOTIFICATIONS
-- ================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- new_lead, bid_update, payment_due, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional notification data
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view own notifications" ON notifications
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Contractors can update own notifications" ON notifications
    FOR UPDATE USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- ================================
-- CHAT MESSAGES
-- ================================
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL, -- Groups related messages
    agent VARCHAR(20) NOT NULL CHECK (agent IN ('lexi', 'alex', 'rex', 'user')),
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'ui_component', 'file', 'action')),
    metadata JSONB, -- Agent-specific data, UI components, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view own chat messages" ON chat_messages
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Contractors can insert own chat messages" ON chat_messages
    FOR INSERT WITH CHECK (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- ================================
-- AGENT EXECUTIONS
-- ================================
CREATE TABLE agent_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    agent VARCHAR(20) NOT NULL CHECK (agent IN ('lexi', 'alex', 'rex')),
    task_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    result JSONB,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- RLS for agent_executions
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view own agent executions" ON agent_executions
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- ================================
-- PAYMENT TRANSACTIONS
-- ================================
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255),
    type VARCHAR(20) NOT NULL CHECK (type IN ('subscription', 'transaction_fee', 'refund')),
    amount DECIMAL(10,2) NOT NULL,
    fee_amount DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
    description TEXT,
    metadata JSONB,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for payment_transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view own payment transactions" ON payment_transactions
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Geographic indexes for location-based queries
CREATE INDEX idx_jobs_location ON jobs USING GIST (location_coordinates);
CREATE INDEX idx_service_areas_coordinates ON service_areas USING GIST (coordinates);

-- Performance indexes
CREATE INDEX idx_contractor_profiles_user_id ON contractor_profiles(user_id);
CREATE INDEX idx_leads_contractor_id ON leads(contractor_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_bids_contractor_id ON bids(contractor_id);
CREATE INDEX idx_bids_job_id ON bids(job_id);
CREATE INDEX idx_notifications_contractor_id ON notifications(contractor_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_chat_messages_contractor_id ON chat_messages(contractor_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_agent_executions_contractor_id ON agent_executions(contractor_id);
CREATE INDEX idx_agent_executions_status ON agent_executions(status);

-- ================================
-- TRIGGERS FOR UPDATED_AT
-- ================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_contractor_profiles_updated_at BEFORE UPDATE ON contractor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- SECURITY FUNCTIONS
-- ================================

-- Function to get current contractor ID
CREATE OR REPLACE FUNCTION get_current_contractor_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM contractor_profiles 
        WHERE user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- VIEWS FOR DASHBOARD
-- ================================

-- Dashboard summary view
CREATE VIEW contractor_dashboard AS
SELECT 
    cp.id as contractor_id,
    cp.company_name,
    cp.tier,
    cp.profile_score,
    cp.onboarding_completed,
    s.status as subscription_status,
    s.current_period_end,
    COUNT(DISTINCT l.id) as total_leads,
    COUNT(DISTINCT CASE WHEN l.status = 'new' THEN l.id END) as new_leads,
    COUNT(DISTINCT b.id) as total_bids,
    COUNT(DISTINCT CASE WHEN b.status = 'accepted' THEN b.id END) as won_bids,
    COUNT(DISTINCT CASE WHEN n.read = false THEN n.id END) as unread_notifications
FROM contractor_profiles cp
LEFT JOIN subscriptions s ON cp.id = s.contractor_id
LEFT JOIN leads l ON cp.id = l.contractor_id
LEFT JOIN bids b ON cp.id = b.contractor_id
LEFT JOIN notifications n ON cp.id = n.contractor_id
WHERE cp.user_id = auth.uid()
GROUP BY cp.id, cp.company_name, cp.tier, cp.profile_score, cp.onboarding_completed, 
         s.status, s.current_period_end;

-- ================================
-- INITIAL DATA (Optional seed data will be inserted via separate scripts)
-- ================================

-- Note: Felix 40-problem data and service areas will be seeded via separate scripts
-- This allows for easier updates and maintenance of reference data
