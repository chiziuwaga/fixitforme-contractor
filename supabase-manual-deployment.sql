-- FixItForMe Contractor - Complete Manual Deployment
-- Copy and paste this entire script into Supabase Dashboard > SQL Editor

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- ================================
-- RLS POLICIES
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

-- contractor_documents RLS
ALTER TABLE contractor_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contractors can manage own documents" ON contractor_documents;
CREATE POLICY "Contractors can manage own documents" ON contractor_documents
    FOR ALL USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- subscriptions RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contractors can view own subscription" ON subscriptions;
CREATE POLICY "Contractors can view own subscription" ON subscriptions
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- leads RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contractors can view own leads" ON leads;
CREATE POLICY "Contractors can view own leads" ON leads
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- bids RLS
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contractors can manage own bids" ON bids;
CREATE POLICY "Contractors can manage own bids" ON bids
    FOR ALL USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- contractor_analytics RLS
ALTER TABLE contractor_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contractors can view own analytics" ON contractor_analytics;
CREATE POLICY "Contractors can view own analytics" ON contractor_analytics
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

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

-- agent_executions RLS
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contractors can view own agent executions" ON agent_executions;
CREATE POLICY "Contractors can view own agent executions" ON agent_executions
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- payment_transactions RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contractors can view own payment transactions" ON payment_transactions;
CREATE POLICY "Contractors can view own payment transactions" ON payment_transactions
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- ================================
-- INDEXES
-- ================================
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs USING GIST (location_coordinates);
CREATE INDEX IF NOT EXISTS idx_service_areas_coordinates ON service_areas USING GIST (coordinates);
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_user_id ON contractor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_contractor_id ON leads(contractor_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_bids_contractor_id ON bids(contractor_id);
CREATE INDEX IF NOT EXISTS idx_bids_job_id ON bids(job_id);
CREATE INDEX IF NOT EXISTS idx_notifications_contractor_id ON notifications(contractor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_chat_messages_contractor_id ON chat_messages(contractor_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_contractor_id ON agent_executions(contractor_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_status ON agent_executions(status);

-- ================================
-- TRIGGERS
-- ================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_contractor_profiles_updated_at ON contractor_profiles;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
DROP TRIGGER IF EXISTS update_bids_updated_at ON bids;

CREATE TRIGGER update_contractor_profiles_updated_at 
    BEFORE UPDATE ON contractor_profiles FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at 
    BEFORE UPDATE ON jobs FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bids_updated_at 
    BEFORE UPDATE ON bids FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- VIEWS
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
GROUP BY cp.id, cp.company_name, cp.tier, cp.profile_score, cp.onboarding_completed, 
         s.status, s.current_period_end;

-- ================================
-- FELIX 40-PROBLEM DATA
-- ================================
DELETE FROM felix_problems;

INSERT INTO felix_problems (id, category, problem_name, description, difficulty_level, avg_cost_min, avg_cost_max, typical_timeline) VALUES
(1, 'plumbing', 'Running Toilet Repair', 'Fix toilet that continuously runs or won''t stop filling', 1, 15.00, 75.00, '30 minutes'),
(2, 'plumbing', 'Leaky Faucet Fix', 'Repair dripping faucet in kitchen or bathroom', 1, 25.00, 150.00, '1 hour'),
(3, 'plumbing', 'Clogged Drain Clearing', 'Clear blocked sink, tub, or shower drain', 1, 35.00, 200.00, '1-2 hours'),
(4, 'electrical', 'Light Fixture Replacement', 'Install new ceiling or wall light fixture', 2, 45.00, 250.00, '2 hours'),
(5, 'electrical', 'Electrical Outlet Repair', 'Fix non-working electrical outlet or GFCI', 2, 35.00, 150.00, '1 hour'),
(6, 'hvac', 'Thermostat Installation', 'Install programmable or smart thermostat', 2, 65.00, 300.00, '1-2 hours'),
(7, 'carpentry', 'Cabinet Door Repair', 'Fix loose, misaligned, or broken cabinet doors', 1, 25.00, 150.00, '2 hours'),
(8, 'exterior', 'Window Screen Repair', 'Replace torn screen mesh or fix frame', 1, 20.00, 100.00, '1 hour'),
(9, 'carpentry', 'Door Lock Replacement', 'Install new deadbolt or door handle set', 2, 45.00, 200.00, '1-2 hours'),
(10, 'flooring', 'Tile Grout Repair', 'Re-grout bathroom or kitchen tiles', 2, 30.00, 180.00, '3 hours'),
(11, 'hvac', 'HVAC Filter Replacement', 'Replace air conditioning and heating filters', 1, 25.00, 100.00, '30 minutes'),
(12, 'drywall', 'Drywall Hole Repair', 'Patch holes in walls from nails, screws, or damage', 2, 35.00, 150.00, '2 hours'),
(13, 'electrical', 'Circuit Breaker Replacement', 'Replace faulty circuit breaker in electrical panel', 4, 75.00, 300.00, '1-2 hours'),
(14, 'plumbing', 'Garbage Disposal Installation', 'Install or replace kitchen garbage disposal unit', 3, 150.00, 450.00, '3 hours'),
(15, 'hvac', 'Ceiling Fan Installation', 'Install ceiling fan with light fixture', 3, 100.00, 400.00, '3 hours'),
(16, 'plumbing', 'Water Heater Repair', 'Fix water heater issues - heating elements, thermostats', 4, 150.00, 600.00, '4 hours'),
(17, 'exterior', 'Gutter Cleaning & Repair', 'Clean gutters and repair loose or damaged sections', 2, 100.00, 350.00, '4 hours'),
(18, 'carpentry', 'Deck Repair', 'Fix loose boards, railings, or structural issues', 3, 200.00, 800.00, '8 hours'),
(19, 'electrical', 'GFCI Outlet Installation', 'Install ground fault circuit interrupter outlets', 2, 85.00, 250.00, '2 hours'),
(20, 'hvac', 'Ductwork Inspection & Sealing', 'Inspect and seal HVAC ductwork for efficiency', 3, 200.00, 600.00, '6 hours'),
(21, 'flooring', 'Hardwood Floor Refinishing', 'Sand and refinish hardwood floors to restore appearance', 4, 500.00, 1500.00, '2-3 days'),
(22, 'carpentry', 'Kitchen Cabinet Installation', 'Install new kitchen cabinets and hardware', 4, 800.00, 3000.00, '3 days'),
(23, 'plumbing', 'Bathroom Renovation - Plumbing', 'Update bathroom plumbing for renovation project', 4, 600.00, 2500.00, '2-3 days'),
(24, 'flooring', 'Tile Floor Installation', 'Install ceramic or stone tile flooring', 3, 400.00, 1200.00, '2 days'),
(25, 'electrical', 'Electrical Panel Upgrade', 'Upgrade electrical panel for increased capacity', 5, 800.00, 2500.00, '1 day'),
(26, 'carpentry', 'Staircase Repair', 'Repair or replace damaged staircase components', 4, 300.00, 1000.00, '1-2 days'),
(27, 'roofing', 'Roof Shingle Replacement', 'Replace damaged or missing roof shingles', 3, 300.00, 800.00, '1 day'),
(28, 'hvac', 'Central Air Installation', 'Install central air conditioning system', 5, 2000.00, 6000.00, '2 days'),
(29, 'plumbing', 'Whole House Repiping', 'Replace old plumbing throughout entire house', 5, 3000.00, 8000.00, '5 days'),
(30, 'carpentry', 'Room Addition Framing', 'Frame new room addition or extension', 5, 2000.00, 6000.00, '1 week'),
(31, 'roofing', 'Emergency Roof Leak Repair', 'Emergency repair of active roof leaks', 3, 200.00, 800.00, '4 hours'),
(32, 'electrical', 'Generator Installation', 'Install backup generator system for home', 5, 1500.00, 5000.00, '1-2 days'),
(33, 'plumbing', 'Sewer Line Repair', 'Repair or replace damaged sewer lines', 5, 1000.00, 4000.00, '2 days'),
(34, 'hvac', 'Boiler System Repair', 'Repair or service home boiler heating system', 4, 300.00, 1200.00, '6 hours'),
(35, 'carpentry', 'Foundation Repair', 'Repair foundation cracks or settlement issues', 5, 1500.00, 6000.00, '3 days'),
(36, 'roofing', 'Skylight Installation', 'Install new skylights in roof', 4, 400.00, 1200.00, '1 day'),
(37, 'electrical', 'Smart Home Wiring', 'Install smart home automation wiring and systems', 4, 800.00, 3000.00, '2 days'),
(38, 'plumbing', 'Water Filtration System', 'Install whole-house water filtration system', 3, 500.00, 2000.00, '6 hours'),
(39, 'hvac', 'Radiant Floor Heating', 'Install radiant floor heating system', 5, 1200.00, 4000.00, '2-3 days'),
(40, 'exterior', 'Solar Panel Installation', 'Install residential solar panel system', 5, 8000.00, 20000.00, '4 days');

-- ================================
-- VERIFICATION
-- ================================
SELECT 'Tables created successfully!' as status;
SELECT COUNT(*) as felix_problems_count FROM felix_problems;
SELECT COUNT(*) as contractor_profiles_count FROM contractor_profiles;
