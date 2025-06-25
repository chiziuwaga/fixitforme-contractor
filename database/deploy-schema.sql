-- Deploy this complete schema to your Supabase instance
-- Go to Supabase Dashboard > SQL Editor and run this script

-- FixItForMe Contractor Module Database Schema
-- Based on Custom_Instructions_Contractor_FixItForMe.md specifications

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.current_user_id" TO '';

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
    contractor_id UUID NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies for contractor_documents
ALTER TABLE contractor_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can manage their own documents" ON contractor_documents
    FOR ALL USING (auth.uid() = (SELECT user_id FROM contractor_profiles WHERE id = contractor_id));

-- ================================
-- SUBSCRIPTIONS
-- ================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')),
    tier VARCHAR(20) DEFAULT 'growth' CHECK (tier IN ('growth', 'scale')),
    price_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================
-- JOBS (Internal Platform Jobs)
-- ================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    customer_id UUID REFERENCES auth.users(id),
    location_address TEXT,
    location_coordinates POINT,
    felix_problem_ids INTEGER[],
    estimated_value DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    urgency VARCHAR(20) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'urgent')),
    contact_info JSONB,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for jobs
CREATE INDEX idx_jobs_location ON jobs USING GIST(location_coordinates);
CREATE INDEX idx_jobs_felix_problems ON jobs USING GIN(felix_problem_ids);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at DESC);

-- RLS Policies for jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jobs are viewable by all contractors" ON jobs
    FOR SELECT USING (true);

-- ================================
-- CONTRACTOR LEADS (External Sources)
-- ================================
CREATE TABLE contractor_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    source VARCHAR(100) NOT NULL, -- 'felix_referral', 'rex_discovery', 'direct_inquiry'
    external_id VARCHAR(255),
    location_city VARCHAR(100),
    location_state VARCHAR(50),
    estimated_value DECIMAL(10,2),
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    urgency_indicators TEXT[],
    quality_score INTEGER DEFAULT 0,
    recency_score INTEGER DEFAULT 0,
    felix_category VARCHAR(100),
    contact_info JSONB,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for contractor_leads
CREATE INDEX idx_contractor_leads_contractor ON contractor_leads(contractor_id);
CREATE INDEX idx_contractor_leads_source ON contractor_leads(source);
CREATE INDEX idx_contractor_leads_quality ON contractor_leads(quality_score DESC);
CREATE INDEX idx_contractor_leads_posted ON contractor_leads(posted_at DESC);

-- RLS Policies for contractor_leads
ALTER TABLE contractor_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view own leads" ON contractor_leads
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM contractor_profiles WHERE id = contractor_id));

CREATE POLICY "Contractors can update own leads" ON contractor_leads
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM contractor_profiles WHERE id = contractor_id));

-- ================================
-- BIDS
-- ================================
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES contractor_leads(id) ON DELETE CASCADE,
    bid_amount DECIMAL(10,2) NOT NULL,
    timeline_days INTEGER,
    proposal_text TEXT,
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'accepted', 'rejected', 'withdrawn')),
    assistance_data JSONB, -- Alex's analysis and guidance
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for bids
CREATE INDEX idx_bids_contractor ON bids(contractor_id);
CREATE INDEX idx_bids_job ON bids(job_id);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_bids_submitted ON bids(submitted_at DESC);

-- RLS Policies for bids
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can manage own bids" ON bids
    FOR ALL USING (auth.uid() = (SELECT user_id FROM contractor_profiles WHERE id = contractor_id));

-- ================================
-- PAYMENTS
-- ================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_id UUID REFERENCES bids(id) ON DELETE CASCADE,
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES auth.users(id),
    amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    contractor_amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('upfront', 'mid_project', 'completion', 'subscription')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    stripe_payment_intent_id VARCHAR(255),
    metadata JSONB,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for payments
CREATE INDEX idx_payments_contractor ON payments(contractor_id);
CREATE INDEX idx_payments_bid ON payments(bid_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_processed ON payments(processed_at DESC);

-- RLS Policies for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view own payments" ON payments
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM contractor_profiles WHERE id = contractor_id));

-- ================================
-- AGENT INTERACTIONS
-- ================================
CREATE TABLE agent_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    agent_type VARCHAR(50) NOT NULL CHECK (agent_type IN ('lexi', 'alex', 'rex')),
    session_id VARCHAR(255),
    interaction_type VARCHAR(100),
    request_data JSONB,
    response_data JSONB,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for agent_interactions
CREATE INDEX idx_agent_interactions_contractor ON agent_interactions(contractor_id);
CREATE INDEX idx_agent_interactions_agent ON agent_interactions(agent_type);
CREATE INDEX idx_agent_interactions_session ON agent_interactions(session_id);
CREATE INDEX idx_agent_interactions_created ON agent_interactions(created_at DESC);

-- RLS Policies for agent_interactions
ALTER TABLE agent_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view own agent interactions" ON agent_interactions
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM contractor_profiles WHERE id = contractor_id));

-- ================================
-- DIY GUIDES (Felix 40-Problem Reference)
-- ================================
CREATE TABLE diy_guides (
    id SERIAL PRIMARY KEY,
    problem_id INTEGER UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty_level VARCHAR(50),
    estimated_time VARCHAR(100),
    tools_needed TEXT[],
    materials_needed TEXT[],
    step_by_step_guide TEXT,
    safety_warnings TEXT[],
    when_to_call_professional TEXT,
    cost_estimate_range VARCHAR(100),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for diy_guides
CREATE INDEX idx_diy_guides_category ON diy_guides(category);
CREATE INDEX idx_diy_guides_difficulty ON diy_guides(difficulty_level);
CREATE INDEX idx_diy_guides_tags ON diy_guides USING GIN(tags);

-- No RLS needed - public read access for problem reference

-- ================================
-- EXECUTION TRACKING
-- ================================
CREATE TABLE execution_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    agent_type VARCHAR(50) NOT NULL CHECK (agent_type IN ('alex', 'rex')),
    status VARCHAR(50) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    progress_percentage INTEGER DEFAULT 0,
    estimated_duration_ms INTEGER,
    actual_duration_ms INTEGER,
    result_data JSONB,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for execution_tracking
CREATE INDEX idx_execution_tracking_contractor ON execution_tracking(contractor_id);
CREATE INDEX idx_execution_tracking_status ON execution_tracking(status);
CREATE INDEX idx_execution_tracking_started ON execution_tracking(started_at DESC);

-- RLS Policies for execution_tracking
ALTER TABLE execution_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view own executions" ON execution_tracking
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM contractor_profiles WHERE id = contractor_id));

-- ================================
-- TRIGGERS FOR UPDATED_AT
-- ================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contractor_profiles_updated_at BEFORE UPDATE ON contractor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diy_guides_updated_at BEFORE UPDATE ON diy_guides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- STORAGE BUCKETS
-- ================================
-- Run these in the Supabase Storage section:
-- CREATE BUCKET contractor-documents (public: false)
-- CREATE BUCKET proof-of-work (public: false)

-- ================================
-- SAMPLE TEST DATA
-- ================================
-- Insert some Felix problems for testing
INSERT INTO diy_guides (problem_id, title, category, difficulty_level, estimated_time, cost_estimate_range) VALUES
(1, 'Running Toilet Repair', 'plumbing', 'easy', '30 minutes', '$5-15'),
(2, 'Leaky Faucet Fix', 'plumbing', 'easy', '45 minutes', '$10-25'),
(3, 'Light Fixture Replacement', 'electrical', 'medium', '1 hour', '$20-50'),
(4, 'Thermostat Installation', 'hvac', 'medium', '2 hours', '$100-200'),
(5, 'Cabinet Repair', 'carpentry', 'medium', '1-2 hours', '$15-40');

-- Sample leads for testing (these will be visible to all contractors for testing)
INSERT INTO contractor_leads (
    contractor_id, title, description, source, location_city, location_state, 
    estimated_value, quality_score, felix_category, contact_info
) VALUES 
(
    (SELECT id FROM contractor_profiles LIMIT 1), -- Will reference first contractor
    'Kitchen Faucet Replacement - Oakland Hills',
    'Need to replace old kitchen faucet with new modern one. Good water pressure, just old fixture.',
    'rex_discovery',
    'Oakland',
    'CA',
    350.00,
    85,
    'plumbing',
    '{"phone": "555-TEST-123", "email": "test@example.com"}'
);

-- ================================
-- COMPLETED SCHEMA DEPLOYMENT
-- ================================
-- Your database is now ready for the FixItForMe Contractor Module!
-- Next steps:
-- 1. Enable Phone auth provider in Supabase Auth settings
-- 2. Create the storage buckets mentioned above
-- 3. Deploy your application with the environment variables
