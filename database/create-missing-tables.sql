-- Create missing tables for FixItForMe Contractor Platform
-- Run this in your Supabase SQL Editor

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
    sku TEXT,
    category TEXT,
    specifications JSONB DEFAULT '{}',
    agentql_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent_usage_tracking table for analytics
CREATE TABLE IF NOT EXISTS agent_usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL CHECK (agent_name IN ('rex', 'alex', 'lexi')),
    action_type TEXT NOT NULL CHECK (action_type IN ('search', 'analysis', 'bid_assistance', 'communication', 'material_research')),
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    tokens_used INTEGER DEFAULT 0,
    processing_time_ms INTEGER DEFAULT 0,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    subscription_tier TEXT CHECK (subscription_tier IN ('growth', 'scale')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_materials_contractor_id ON materials(contractor_id);
CREATE INDEX IF NOT EXISTS idx_materials_project_id ON materials(project_id);
CREATE INDEX IF NOT EXISTS idx_materials_supplier ON materials(supplier);
CREATE INDEX IF NOT EXISTS idx_materials_created_at ON materials(created_at);

CREATE INDEX IF NOT EXISTS idx_agent_usage_contractor_id ON agent_usage_tracking(contractor_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_agent_name ON agent_usage_tracking(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_usage_action_type ON agent_usage_tracking(action_type);
CREATE INDEX IF NOT EXISTS idx_agent_usage_created_at ON agent_usage_tracking(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for materials table
CREATE POLICY "Contractors can view their own materials" ON materials
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Contractors can insert their own materials" ON materials
    FOR INSERT WITH CHECK (
        contractor_id IN (
            SELECT id FROM contractor_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Contractors can update their own materials" ON materials
    FOR UPDATE USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Contractors can delete their own materials" ON materials
    FOR DELETE USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for agent_usage_tracking table
CREATE POLICY "Contractors can view their own usage data" ON agent_usage_tracking
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert usage tracking" ON agent_usage_tracking
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON materials TO authenticated;
GRANT ALL ON agent_usage_tracking TO authenticated;

-- Verification query
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'materials' AND table_schema = 'public') 
        THEN '✅ materials table created successfully' 
        ELSE '❌ materials table creation failed' 
    END as materials_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_usage_tracking' AND table_schema = 'public') 
        THEN '✅ agent_usage_tracking table created successfully' 
        ELSE '❌ agent_usage_tracking table creation failed' 
    END as tracking_status;
