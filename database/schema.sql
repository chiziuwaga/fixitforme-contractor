-- FixItForMe Contractor Module Database Schema
-- Based on Custom_Instructions_Contractor_FixItForMe.md specifications

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.current_user_id" TO '';

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geographic queries

-- ================================
-- WHATSAPP OTP VERIFICATION
-- ================================
-- Create WhatsApp OTPs table for secure verification
CREATE TABLE IF NOT EXISTS whatsapp_otps (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_phone_format CHECK (phone_number ~ '^\+[1-9]\d{1,14}$'),
  CONSTRAINT valid_otp_format CHECK (otp_code ~ '^\d{6}$')
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_otps_phone_expiry 
ON whatsapp_otps(phone_number, expires_at);

-- Enable RLS (Row Level Security)
ALTER TABLE whatsapp_otps ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow service role to manage OTPs
CREATE POLICY "Service role can manage whatsapp_otps" ON whatsapp_otps
FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions to service role
GRANT ALL ON whatsapp_otps TO service_role;
GRANT USAGE ON SEQUENCE whatsapp_otps_id_seq TO service_role;

-- Create function to automatically clean up expired OTPs (with secure search_path)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM whatsapp_otps WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$;

-- ================================
-- AUTHENTICATION FUNCTIONS
-- ================================

-- Function to ensure contractor profile exists (with secure search_path)
CREATE OR REPLACE FUNCTION public.ensure_contractor_profile(user_uuid uuid, phone_number text)
RETURNS TABLE(profile_id uuid, is_new boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    existing_profile_id uuid;
    new_profile_id uuid;
BEGIN
    -- Check for existing profile by user_id first
    SELECT id INTO existing_profile_id
    FROM contractor_profiles 
    WHERE user_id = user_uuid;
    
    IF existing_profile_id IS NOT NULL THEN
        RETURN QUERY SELECT existing_profile_id, false;
        RETURN;
    END IF;
    
    -- Check for existing profile by phone
    SELECT id INTO existing_profile_id
    FROM contractor_profiles 
    WHERE contact_phone = phone_number;
    
    IF existing_profile_id IS NOT NULL THEN
        -- Update existing profile with user_id using explicit timestamp
        UPDATE contractor_profiles 
        SET user_id = user_uuid,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = existing_profile_id;
        
        RETURN QUERY SELECT existing_profile_id, false;
        RETURN;
    END IF;
    
    -- Create new profile with explicit timestamp instead of NOW()
    INSERT INTO contractor_profiles (
        user_id,
        contact_phone,
        tier,
        created_at,
        updated_at
    ) VALUES (
        user_uuid,
        phone_number,
        'growth',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) RETURNING id INTO new_profile_id;
    
    RETURN QUERY SELECT new_profile_id, true;
END;
$$;

-- Function to sync phone number to contractor profile (application-callable)
-- Note: This function exists for completeness but cannot be used as a trigger on auth.users
CREATE OR REPLACE FUNCTION public.sync_phone_to_contractor_profile(user_uuid uuid, new_phone text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    -- Update contractor profile when phone changes (called from application)
    UPDATE contractor_profiles 
    SET contact_phone = new_phone,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = user_uuid;
END;
$$;

-- Grant permissions to service role for authentication functions
GRANT EXECUTE ON FUNCTION public.ensure_contractor_profile(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_phone_to_contractor_profile(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_otps() TO service_role;

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

-- Optimized RLS policies with efficient auth function calls (fixes auth_rls_initplan warning)
CREATE POLICY "contractor_profiles_select_policy" ON contractor_profiles
    FOR SELECT
    TO authenticated, anon
    USING (
        -- Use subquery to avoid re-evaluation per row
        user_id = (SELECT auth.uid()) 
        OR 
        (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
    );

CREATE POLICY "contractor_profiles_insert_policy" ON contractor_profiles
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (
        user_id = (SELECT auth.uid())
        OR 
        (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
    );

CREATE POLICY "contractor_profiles_update_policy" ON contractor_profiles
    FOR UPDATE
    TO authenticated, anon
    USING (
        user_id = (SELECT auth.uid())
        OR 
        (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
    )
    WITH CHECK (
        user_id = (SELECT auth.uid())
        OR 
        (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
    );

CREATE POLICY "contractor_profiles_delete_policy" ON contractor_profiles
    FOR DELETE
    TO authenticated, anon
    USING (
        user_id = (SELECT auth.uid())
        OR 
        (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
    );

-- ================================
-- CONTRACTOR DOCUMENTS
-- ================================
CREATE TABLE contractor_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- e.g., 'business_license', 'certification'
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

CREATE POLICY "Bids can be managed by the bidder" ON bids
    FOR ALL USING (auth.uid() = (SELECT user_id FROM contractor_profiles WHERE id = contractor_id))
    WITH CHECK (auth.uid() = (SELECT user_id FROM contractor_profiles WHERE id = contractor_id));

-- ================================
-- TRANSACTIONS
-- ================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    contractor_id UUID NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('subscription', 'payout', 'refund')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed')),
    stripe_charge_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view their own transactions" ON transactions
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM contractor_profiles WHERE id = contractor_id));

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
-- CONTRACTOR SERVICE REGIONS (Geographic Coverage Areas)
-- ================================
CREATE TABLE contractor_service_regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    region_name VARCHAR(100) NOT NULL, -- "San Francisco Bay Area", "Greater Austin", etc.
    center_coordinates POINT NOT NULL, -- Contractor's base location or region center
    service_radius_miles INTEGER DEFAULT 25, -- How far they're willing to travel
    region_type VARCHAR(50) CHECK (region_type IN ('city', 'metro_area', 'county', 'multi_county', 'custom')) DEFAULT 'metro_area',
    state_code VARCHAR(2) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Common service areas lookup (for onboarding suggestions)
CREATE TABLE common_service_areas (
    id SERIAL PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL,
    area_type VARCHAR(50) CHECK (area_type IN ('metro_area', 'city', 'county', 'region')) DEFAULT 'metro_area',
    state_code VARCHAR(2) NOT NULL,
    center_coordinates POINT NOT NULL,
    typical_radius_miles INTEGER DEFAULT 25,
    population_estimate INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for contractor service regions
CREATE INDEX idx_contractor_regions_contractor ON contractor_service_regions(contractor_id);
CREATE INDEX idx_contractor_regions_state ON contractor_service_regions(state_code);
CREATE INDEX idx_contractor_regions_coordinates ON contractor_service_regions USING GIST(center_coordinates);
CREATE INDEX idx_contractor_regions_active ON contractor_service_regions(active);

-- Indexes for common service areas
CREATE INDEX idx_common_areas_state ON common_service_areas(state_code);
CREATE INDEX idx_common_areas_type ON common_service_areas(area_type);
CREATE INDEX idx_common_areas_coordinates ON common_service_areas USING GIST(center_coordinates);

-- RLS Policies for contractor service regions
ALTER TABLE contractor_service_regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can manage own service regions" ON contractor_service_regions
    FOR ALL USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for common service areas (public read access)
ALTER TABLE common_service_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Common service areas are publicly readable" ON common_service_areas
    FOR SELECT USING (active = true);

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
-- FELIX FRAMEWORK TABLES (40-PROBLEM REFERENCE SYSTEM)
-- ================================

-- Felix Problems: Core 40-problem framework that drives all categorization
CREATE TABLE felix_problems (
    id INTEGER PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    typical_cost_min DECIMAL(8,2),
    typical_cost_max DECIMAL(8,2),
    typical_time_hours DECIMAL(4,2),
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    required_skills TEXT[],
    common_materials TEXT[],
    seasonal_factor DECIMAL(3,2) DEFAULT 1.0,
    emergency_priority VARCHAR(20) CHECK (emergency_priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Felix Categories: Service categories derived from the 40 problems
CREATE TABLE felix_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    search_terms TEXT[],
    value_threshold INTEGER DEFAULT 150,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Felix framework tables
CREATE INDEX idx_felix_problems_category ON felix_problems(category);
CREATE INDEX idx_felix_problems_difficulty ON felix_problems(difficulty_level);
CREATE INDEX idx_felix_problems_emergency ON felix_problems(emergency_priority);
CREATE INDEX idx_felix_categories_name ON felix_categories(category_name);

-- RLS Policies for Felix framework (public read access)
ALTER TABLE felix_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE felix_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Felix problems are publicly readable" ON felix_problems
    FOR SELECT USING (true);

CREATE POLICY "Felix categories are publicly readable" ON felix_categories
    FOR SELECT USING (true);

-- ================================
-- SAMPLE DATA INSERTION
-- ================================

-- This will be populated by the Felix 40-problem JSON data
-- INSERT INTO diy_guides (service_id, service_name, category, ...) VALUES ...
