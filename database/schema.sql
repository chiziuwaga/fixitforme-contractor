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
    pricing_tier VARCHAR(20) DEFAULT 'growth' CHECK (pricing_tier IN ('growth', 'scale')),
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
-- JOBS (Internal Platform Jobs)
-- ================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    customer_id UUID REFERENCES auth.users(id),
    location_address TEXT,
    location_coordinates POINT, -- For geographic searches
    felix_problem_ids INTEGER[], -- Reference to Felix 40-problem framework
    estimated_value DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    urgency VARCHAR(20) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'urgent')),
    contact_info JSONB, -- Phone, email, preferred contact method
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
    source VARCHAR(100) NOT NULL, -- 'craigslist', 'sams_gov', 'municipal_site'
    source_url TEXT UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    location_city VARCHAR(100),
    location_state VARCHAR(50),
    location_coordinates POINT,
    estimated_value DECIMAL(10,2),
    contact_info JSONB, -- Extracted phone, email, etc.
    felix_problem_id INTEGER, -- Mapped to Felix framework
    quality_score INTEGER DEFAULT 0, -- Rex's quality assessment (0-100)
    recency_score INTEGER DEFAULT 0, -- Freshness score (0-100)
    posted_at TIMESTAMP WITH TIME ZONE,
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB -- Additional platform-specific data
);

-- Indexes for contractor_leads
CREATE INDEX idx_leads_source ON contractor_leads(source);
CREATE INDEX idx_leads_location ON contractor_leads USING GIST(location_coordinates);
CREATE INDEX idx_leads_felix_problem ON contractor_leads(felix_problem_id);
CREATE INDEX idx_leads_quality_score ON contractor_leads(quality_score DESC);
CREATE INDEX idx_leads_recency_score ON contractor_leads(recency_score DESC);
CREATE INDEX idx_leads_posted_at ON contractor_leads(posted_at DESC);
CREATE INDEX idx_leads_discovered_at ON contractor_leads(discovered_at DESC);

-- RLS Policies for contractor_leads
ALTER TABLE contractor_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leads are viewable by all contractors" ON contractor_leads
    FOR SELECT USING (true);

-- ================================
-- BIDS
-- ================================
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES contractor_leads(id) ON DELETE CASCADE,
    bid_amount DECIMAL(10,2) NOT NULL,
    proposal_text TEXT,
    estimated_timeline VARCHAR(100), -- "2-3 weeks", "5 business days", etc.
    assistance_data JSONB, -- Alex's analysis and conversation history
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'accepted', 'rejected', 'withdrawn')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one of job_id or lead_id is set
    CONSTRAINT bid_target_check CHECK (
        (job_id IS NOT NULL AND lead_id IS NULL) OR 
        (job_id IS NULL AND lead_id IS NOT NULL)
    )
);

-- Indexes for bids
CREATE INDEX idx_bids_contractor ON bids(contractor_id);
CREATE INDEX idx_bids_job ON bids(job_id);
CREATE INDEX idx_bids_lead ON bids(lead_id);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_bids_submitted_at ON bids(submitted_at DESC);

-- RLS Policies for bids
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view own bids" ON bids
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Contractors can manage own bids" ON bids
    FOR ALL USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- ================================
-- REX SEARCH SESSIONS
-- ================================
CREATE TABLE rex_search_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    search_parameters JSONB, -- Geographic area, Felix problems, value thresholds
    leads_found INTEGER DEFAULT 0,
    session_duration INTEGER, -- seconds
    status VARCHAR(50) DEFAULT 'running' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for rex_search_sessions
CREATE INDEX idx_rex_sessions_contractor ON rex_search_sessions(contractor_id);
CREATE INDEX idx_rex_sessions_status ON rex_search_sessions(status);
CREATE INDEX idx_rex_sessions_started_at ON rex_search_sessions(started_at DESC);

-- RLS Policies for rex_search_sessions
ALTER TABLE rex_search_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view own search sessions" ON rex_search_sessions
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- ================================
-- DIY GUIDES (Felix 40-Problem Framework)
-- ================================
CREATE TABLE diy_guides (
    id SERIAL PRIMARY KEY,
    service_id UUID UNIQUE NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('Easy', 'Medium', 'Hard')),
    safety_risk VARCHAR(20) CHECK (safety_risk IN ('Low', 'Medium', 'High')),
    time_estimate_minutes INTEGER,
    cost_estimate_range VARCHAR(100),
    instructions JSONB, -- Array of step-by-step instructions
    tools_needed JSONB, -- Array of required tools
    materials JSONB, -- Array of materials with costs
    safety_warnings TEXT,
    resource_video_url TEXT,
    resource_article_url TEXT,
    is_pro_recommended_by_default BOOLEAN DEFAULT FALSE,
    available_tiers JSONB, -- ['free', 'premium']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for diy_guides
CREATE INDEX idx_diy_guides_category ON diy_guides(category);
CREATE INDEX idx_diy_guides_difficulty ON diy_guides(difficulty_level);
CREATE INDEX idx_diy_guides_safety_risk ON diy_guides(safety_risk);

-- RLS Policies for diy_guides (public read access)
ALTER TABLE diy_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "DIY guides are publicly readable" ON diy_guides
    FOR SELECT USING (true);

-- ================================
-- PAYMENTS & SUBSCRIPTIONS
-- ================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    stripe_payment_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_type VARCHAR(50) CHECK (payment_type IN ('subscription', 'transaction_fee', 'payout')),
    status VARCHAR(50) CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    metadata JSONB, -- Stripe metadata, job references, etc.
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for payments
CREATE INDEX idx_payments_contractor ON payments(contractor_id);
CREATE INDEX idx_payments_stripe_id ON payments(stripe_payment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_processed_at ON payments(processed_at DESC);

-- RLS Policies for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view own payments" ON payments
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- ================================
-- UTILITY FUNCTIONS
-- ================================

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance_miles(point1 POINT, point2 POINT)
RETURNS DECIMAL AS $$
BEGIN
    -- Simple Haversine formula approximation
    -- For production, use PostGIS ST_Distance_Sphere
    RETURN (
        3959 * acos(
            cos(radians(point1[1])) * cos(radians(point2[1])) * 
            cos(radians(point2[0]) - radians(point1[0])) + 
            sin(radians(point1[1])) * sin(radians(point2[1]))
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_contractor_profiles_updated_at
    BEFORE UPDATE ON contractor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at
    BEFORE UPDATE ON bids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- SAMPLE DATA INSERTION
-- ================================

-- This will be populated by the Felix 40-problem JSON data
-- INSERT INTO diy_guides (service_id, service_name, category, ...) VALUES ...
