-- FixItForMe Contractor - Database Deployment with Verification
-- Copy and paste this entire script into Supabase Dashboard > SQL Editor
-- This script includes verification statements to confirm successful deployment

-- ================================
-- INITIAL VERIFICATION
-- ================================
SELECT 'Starting FixItForMe Contractor database deployment...' as status;
SELECT current_database() as database_name;
SELECT current_timestamp as deployment_started_at;

-- ================================
-- EXTENSIONS
-- ================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

SELECT 'Extensions installed successfully' as status;

-- ================================
-- CONTRACTOR PROFILES
-- ================================
CREATE TABLE IF NOT EXISTS contractor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    contact_phone VARCHAR(20),
    business_license VARCHAR(100),
    service_areas JSONB,
    services_offered JSONB,
    tier VARCHAR(20) DEFAULT 'growth' CHECK (tier IN ('growth', 'scale')),
    stripe_customer_id VARCHAR(255),
    rex_search_usage INTEGER DEFAULT 0,
    max_bids_per_month INTEGER DEFAULT 10,
    current_bids_this_month INTEGER DEFAULT 0,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    profile_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'contractor_profiles table created' as status;

-- ================================
-- CONTRACTOR DOCUMENTS
-- ================================
CREATE TABLE IF NOT EXISTS contractor_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'contractor_documents table created' as status;

-- ================================
-- SUBSCRIPTIONS
-- ================================
CREATE TABLE IF NOT EXISTS subscriptions (
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
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'subscriptions table created' as status;

-- ================================
-- JOBS
-- ================================
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    homeowner_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    felix_problem_ids JSONB,
    location_address TEXT,
    location_coordinates POINT,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'emergency')),
    status VARCHAR(20) DEFAULT 'posted' CHECK (status IN ('posted', 'in_progress', 'completed', 'cancelled')),
    images JSONB,
    requirements JSONB,
    timeline VARCHAR(100),
    contact_info JSONB,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'jobs table created' as status;

-- ================================
-- LEADS
-- ================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    match_score INTEGER DEFAULT 0,
    generated_by VARCHAR(20) DEFAULT 'rex' CHECK (generated_by IN ('rex', 'manual', 'referral')),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'contacted', 'quoted', 'won', 'lost')),
    rex_research_data JSONB,
    distance_miles DECIMAL(6,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'leads table created' as status;

-- ================================
-- BIDS
-- ================================
CREATE TABLE IF NOT EXISTS bids (
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
    alex_assistance_data JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'bids table created' as status;

-- ================================
-- FELIX 40-PROBLEM REFERENCE
-- ================================
CREATE TABLE IF NOT EXISTS felix_problems (
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

SELECT 'felix_problems table created' as status;

-- ================================
-- SERVICE AREAS
-- ================================
CREATE TABLE IF NOT EXISTS service_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    state VARCHAR(2) NOT NULL,
    coordinates POINT,
    boundary POLYGON,
    population INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'service_areas table created' as status;

-- ================================
-- CONTRACTOR ANALYTICS
-- ================================
CREATE TABLE IF NOT EXISTS contractor_analytics (
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

SELECT 'contractor_analytics table created' as status;

-- ================================
-- NOTIFICATIONS
-- ================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'notifications table created' as status;

-- ================================
-- CHAT MESSAGES
-- ================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    agent VARCHAR(20) NOT NULL CHECK (agent IN ('lexi', 'alex', 'rex', 'user')),
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'ui_component', 'file', 'action')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'chat_messages table created' as status;

-- ================================
-- AGENT EXECUTIONS
-- ================================
CREATE TABLE IF NOT EXISTS agent_executions (
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

SELECT 'agent_executions table created' as status;

-- ================================
-- PAYMENT TRANSACTIONS
-- ================================
CREATE TABLE IF NOT EXISTS payment_transactions (
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

SELECT 'payment_transactions table created' as status;

-- ================================
-- ROW LEVEL SECURITY POLICIES
-- ================================

-- contractor_profiles RLS
ALTER TABLE contractor_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contractors can view own profile" ON contractor_profiles;
DROP POLICY IF EXISTS "Contractors can update own profile" ON contractor_profiles;
DROP POLICY IF EXISTS "Contractors can insert own profile" ON contractor_profiles;

CREATE POLICY "Contractors can view own profile" ON contractor_profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Contractors can update own profile" ON contractor_profiles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Contractors can insert own profile" ON contractor_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

SELECT 'contractor_profiles RLS policies created' as status;

-- contractor_documents RLS
ALTER TABLE contractor_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contractors can manage own documents" ON contractor_documents;
CREATE POLICY "Contractors can manage own documents" ON contractor_documents
    FOR ALL USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

SELECT 'contractor_documents RLS policies created' as status;

-- subscriptions RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contractors can view own subscription" ON subscriptions;
CREATE POLICY "Contractors can view own subscription" ON subscriptions
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

SELECT 'subscriptions RLS policies created' as status;

-- jobs RLS (public read access)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Jobs are viewable by all contractors" ON jobs;
CREATE POLICY "Jobs are viewable by all contractors" ON jobs
    FOR SELECT USING (true);

SELECT 'jobs RLS policies created' as status;

-- leads RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contractors can view own leads" ON leads;
CREATE POLICY "Contractors can view own leads" ON leads
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

SELECT 'leads RLS policies created' as status;

-- bids RLS
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contractors can manage own bids" ON bids;
CREATE POLICY "Contractors can manage own bids" ON bids
    FOR ALL USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

SELECT 'bids RLS policies created' as status;

-- contractor_analytics RLS
ALTER TABLE contractor_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contractors can view own analytics" ON contractor_analytics;
CREATE POLICY "Contractors can view own analytics" ON contractor_analytics
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

SELECT 'contractor_analytics RLS policies created' as status;

-- notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contractors can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Contractors can update own notifications" ON notifications;
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

SELECT 'notifications RLS policies created' as status;

-- chat_messages RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contractors can view own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Contractors can insert own chat messages" ON chat_messages;
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

SELECT 'chat_messages RLS policies created' as status;

-- agent_executions RLS
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contractors can view own agent executions" ON agent_executions;
CREATE POLICY "Contractors can view own agent executions" ON agent_executions
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

SELECT 'agent_executions RLS policies created' as status;

-- payment_transactions RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contractors can view own payment transactions" ON payment_transactions;
CREATE POLICY "Contractors can view own payment transactions" ON payment_transactions
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

SELECT 'payment_transactions RLS policies created' as status;

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_user_id ON contractor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_contractor_documents_contractor_id ON contractor_documents(contractor_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_contractor_id ON subscriptions(contractor_id);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs USING GIST (location_coordinates);
CREATE INDEX IF NOT EXISTS idx_leads_contractor_id ON leads(contractor_id);
CREATE INDEX IF NOT EXISTS idx_bids_contractor_id ON bids(contractor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_contractor_id ON notifications(contractor_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_contractor_id ON chat_messages(contractor_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_contractor_id ON agent_executions(contractor_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_contractor_id ON payment_transactions(contractor_id);

SELECT 'Performance indexes created' as status;

-- ================================
-- SAMPLE FELIX PROBLEMS DATA
-- ================================
INSERT INTO felix_problems (id, category, problem_name, description, difficulty_level, avg_cost_min, avg_cost_max, typical_timeline) VALUES
(1, 'plumbing', 'Running Toilet Repair', 'Repair or service home toilet that runs continuously', 2, 25.00, 150.00, '1-2 hours'),
(2, 'plumbing', 'Leaky Faucet Fix', 'Fix dripping or leaking kitchen or bathroom faucet', 2, 15.00, 100.00, '45 minutes'),
(3, 'electrical', 'Light Fixture Replacement', 'Replace broken or outdated light fixtures', 3, 30.00, 200.00, '1 hour'),
(4, 'hvac', 'Thermostat Installation', 'Install new programmable or smart thermostat', 3, 80.00, 300.00, '2 hours'),
(5, 'carpentry', 'Cabinet Repair', 'Repair damaged kitchen or bathroom cabinets', 3, 25.00, 150.00, '1-2 hours'),
(6, 'plumbing', 'Garbage Disposal Installation', 'Install new garbage disposal unit', 3, 100.00, 400.00, '2-3 hours'),
(7, 'electrical', 'Outlet Installation', 'Install new electrical outlets or GFCI outlets', 3, 40.00, 150.00, '1-2 hours'),
(8, 'hvac', 'Air Filter Replacement', 'Replace HVAC system air filters', 1, 10.00, 50.00, '15 minutes'),
(9, 'plumbing', 'Water Heater Repair', 'Repair or service residential water heater', 4, 150.00, 800.00, '4-6 hours'),
(10, 'electrical', 'Ceiling Fan Installation', 'Install new ceiling fan with light fixture', 3, 75.00, 300.00, '2-3 hours')
ON CONFLICT (id) DO NOTHING;

SELECT 'Felix problems sample data inserted' as status;
SELECT COUNT(*) as felix_problems_count FROM felix_problems;

-- ================================
-- VIEWS FOR DASHBOARD
-- ================================
DROP VIEW IF EXISTS contractor_dashboard;
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
GROUP BY cp.id, cp.company_name, cp.tier, cp.profile_score, cp.onboarding_completed, s.status, s.current_period_end;

SELECT 'contractor_dashboard view created' as status;

-- ================================
-- FINAL VERIFICATION
-- ================================
SELECT 'Deployment completed successfully!' as status;
SELECT current_timestamp as deployment_completed_at;

-- Table verification
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%contractor%' OR tablename IN ('jobs', 'leads', 'bids', 'felix_problems', 'notifications', 'chat_messages', 'agent_executions', 'payment_transactions')
ORDER BY tablename;

-- RLS verification
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND (tablename LIKE '%contractor%' OR tablename IN ('jobs', 'leads', 'bids', 'notifications', 'chat_messages', 'agent_executions', 'payment_transactions'))
ORDER BY tablename;

-- Policy verification
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Index verification
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND (tablename LIKE '%contractor%' OR tablename IN ('jobs', 'leads', 'bids', 'notifications', 'chat_messages', 'agent_executions', 'payment_transactions'))
ORDER BY tablename, indexname;

-- Final status
SELECT 
    'Database deployment verification complete!' as final_status,
    COUNT(DISTINCT table_name) as total_tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%contractor%' OR table_name IN ('jobs', 'leads', 'bids', 'felix_problems', 'service_areas', 'notifications', 'chat_messages', 'agent_executions', 'payment_transactions', 'subscriptions'));

SELECT 'Ready for mobile authentication testing!' as next_step;
