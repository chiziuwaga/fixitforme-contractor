-- Service Areas Data Seeding
-- Geographic areas that contractors can serve

-- Create service_areas table if not exists (add to main schema)
CREATE TABLE IF NOT EXISTS service_areas (
    id SERIAL PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    region VARCHAR(50),
    zip_codes TEXT[], -- Array of zip codes in this area
    is_major_metro BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for service_areas (public read access)
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service areas are publicly readable" ON service_areas FOR SELECT USING (true);

-- Clear existing data
TRUNCATE service_areas RESTART IDENTITY;

-- Insert Bay Area service areas (expand as needed)
INSERT INTO service_areas (area_name, state_code, region, zip_codes, is_major_metro) VALUES
-- San Francisco Bay Area
('San Francisco', 'CA', 'bay_area', ARRAY['94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110', '94111', '94112', '94114', '94115', '94116', '94117', '94118', '94121', '94122', '94123', '94124', '94127', '94129', '94130', '94131', '94132', '94133', '94134', '94158'], true),
('Oakland', 'CA', 'bay_area', ARRAY['94601', '94602', '94603', '94605', '94606', '94607', '94608', '94609', '94610', '94611', '94612', '94613', '94618', '94619', '94621'], true),
('San Jose', 'CA', 'bay_area', ARRAY['95110', '95111', '95112', '95113', '95116', '95117', '95118', '95119', '95120', '95121', '95122', '95123', '95124', '95125', '95126', '95127', '95128', '95129', '95130', '95131', '95132', '95133', '95134', '95135', '95136', '95138', '95139'], true),
('Berkeley', 'CA', 'bay_area', ARRAY['94701', '94702', '94703', '94704', '94705', '94707', '94708', '94709', '94710', '94712', '94720'], false),
('Palo Alto', 'CA', 'bay_area', ARRAY['94301', '94302', '94303', '94304', '94305', '94306'], false),
('San Mateo', 'CA', 'bay_area', ARRAY['94401', '94402', '94403', '94404'], false),
('Fremont', 'CA', 'bay_area', ARRAY['94536', '94537', '94538', '94539'], false),
('Hayward', 'CA', 'bay_area', ARRAY['94541', '94542', '94544', '94545'], false),
('Mountain View', 'CA', 'bay_area', ARRAY['94035', '94039', '94040', '94041', '94043'], false),
('Sunnyvale', 'CA', 'bay_area', ARRAY['94085', '94086', '94087', '94089'], false),

-- Expandable to other regions
('Los Angeles', 'CA', 'socal', ARRAY['90001', '90002', '90003', '90004', '90005', '90006', '90007', '90008', '90010', '90011', '90012', '90013', '90014', '90015'], true),
('San Diego', 'CA', 'socal', ARRAY['92101', '92102', '92103', '92104', '92105', '92106', '92107', '92108', '92109', '92110', '92111', '92113'], true),

-- Update sequence
SELECT setval('service_areas_id_seq', (SELECT MAX(id) FROM service_areas));
