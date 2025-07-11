-- Service Areas Table for Dynamic Geographic Coverage
-- This allows contractors from any location to register their service areas

CREATE TABLE service_areas (
    id SERIAL PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL,
    area_type VARCHAR(50) CHECK (area_type IN ('city', 'county', 'state', 'zipcode', 'region')) DEFAULT 'city',
    state_code VARCHAR(2) NOT NULL, -- US state abbreviation
    county VARCHAR(100),
    zipcode VARCHAR(10),
    coordinates POINT, -- Geographic center point
    population INTEGER,
    market_size VARCHAR(20) CHECK (market_size IN ('small', 'medium', 'large', 'metro')) DEFAULT 'medium',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_service_areas_state ON service_areas(state_code);
CREATE INDEX idx_service_areas_area_type ON service_areas(area_type);
CREATE INDEX idx_service_areas_active ON service_areas(active);
CREATE INDEX idx_service_areas_market_size ON service_areas(market_size);
CREATE INDEX idx_service_areas_coordinates ON service_areas USING GIST(coordinates);

-- RLS Policies (public read access for service area selection)
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service areas are publicly readable" ON service_areas
    FOR SELECT USING (active = true);

-- Admin-only insert/update policies (for future expansion)
CREATE POLICY "Admin can manage service areas" ON service_areas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM contractor_profiles 
            WHERE user_id = auth.uid() 
            AND tier = 'admin'
        )
    );
