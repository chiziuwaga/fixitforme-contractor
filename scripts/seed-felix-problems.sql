-- Felix 40-Problem Reference Data Seeding
-- This script populates the felix_problems table with the complete problem framework

INSERT INTO felix_problems (id, category, title, description, typical_cost_min, typical_cost_max, typical_time_hours, difficulty_level, required_skills, common_materials, seasonal_factor, emergency_priority) VALUES

-- Problems #1-10: Basic Repairs & Maintenance
(1, 'plumbing', 'Running Toilet Repair', 'Fix toilet that continuously runs or won''t stop filling', 15, 75, 0.5, 'beginner', ARRAY['basic plumbing'], ARRAY['flapper', 'chain', 'fill valve'], 1.0, 'low'),
(2, 'plumbing', 'Leaky Faucet Fix', 'Repair dripping faucet in kitchen or bathroom', 25, 150, 1.0, 'beginner', ARRAY['basic plumbing'], ARRAY['O-rings', 'washers', 'cartridge'], 1.0, 'low'),
(3, 'plumbing', 'Clogged Drain Clearing', 'Clear blocked sink, tub, or shower drain', 35, 200, 1.5, 'beginner', ARRAY['basic plumbing'], ARRAY['drain snake', 'plunger', 'drain cleaner'], 1.0, 'medium'),
(4, 'electrical', 'Light Fixture Replacement', 'Install new ceiling or wall light fixture', 45, 250, 2.0, 'intermediate', ARRAY['electrical basics', 'wire nuts'], ARRAY['fixture', 'wire nuts', 'electrical box'], 1.0, 'low'),
(5, 'electrical', 'Electrical Outlet Repair', 'Fix non-working electrical outlet or GFCI', 35, 150, 1.0, 'intermediate', ARRAY['electrical safety'], ARRAY['outlet', 'wire nuts', 'electrical tape'], 1.0, 'medium'),
(6, 'hvac', 'Thermostat Installation', 'Install programmable or smart thermostat', 65, 300, 1.5, 'intermediate', ARRAY['electrical basics'], ARRAY['thermostat', 'wire nuts'], 1.0, 'low'),
(7, 'carpentry', 'Cabinet Door Repair', 'Fix loose, misaligned, or broken cabinet doors', 25, 150, 2.0, 'beginner', ARRAY['basic carpentry'], ARRAY['hinges', 'screws', 'wood glue'], 1.0, 'low'),
(8, 'exterior', 'Window Screen Repair', 'Replace torn screen mesh or fix frame', 20, 100, 1.0, 'beginner', ARRAY['basic tools'], ARRAY['screen mesh', 'spline', 'frame'], 1.2, 'low'),
(9, 'carpentry', 'Door Lock Replacement', 'Install new deadbolt or door handle set', 45, 200, 1.5, 'intermediate', ARRAY['drilling', 'measuring'], ARRAY['lock set', 'drill bits'], 1.0, 'medium'),
(10, 'flooring', 'Tile Grout Repair', 'Re-grout bathroom or kitchen tiles', 30, 180, 3.0, 'intermediate', ARRAY['tiling'], ARRAY['grout', 'grout float', 'sealant'], 1.0, 'low'),

-- Problems #11-20: System Work & Upgrades  
(11, 'hvac', 'HVAC Filter Replacement', 'Replace air conditioning and heating filters', 25, 100, 0.5, 'beginner', ARRAY['basic maintenance'], ARRAY['HVAC filters'], 1.3, 'low'),
(12, 'structural', 'Drywall Hole Repair', 'Patch holes in walls from nails, screws, or damage', 35, 150, 2.0, 'intermediate', ARRAY['drywall work'], ARRAY['drywall patch', 'joint compound', 'sandpaper'], 1.0, 'low'),
(13, 'electrical', 'Circuit Breaker Replacement', 'Replace faulty circuit breaker in electrical panel', 75, 300, 1.5, 'advanced', ARRAY['electrical safety', 'electrical codes'], ARRAY['circuit breaker'], 1.0, 'high'),
(14, 'plumbing', 'Garbage Disposal Installation', 'Install or replace kitchen garbage disposal unit', 150, 450, 3.0, 'intermediate', ARRAY['plumbing', 'electrical'], ARRAY['disposal unit', 'mounting assembly'], 1.0, 'medium'),
(15, 'hvac', 'Ceiling Fan Installation', 'Install ceiling fan with light fixture', 100, 400, 3.0, 'intermediate', ARRAY['electrical', 'mounting'], ARRAY['ceiling fan', 'mounting box', 'wire nuts'], 1.0, 'low'),
(16, 'plumbing', 'Water Heater Repair', 'Fix water heater issues - heating elements, thermostats', 150, 600, 4.0, 'advanced', ARRAY['plumbing', 'electrical'], ARRAY['heating elements', 'thermostats'], 1.0, 'high'),
(17, 'exterior', 'Gutter Cleaning & Repair', 'Clean gutters and repair loose or damaged sections', 100, 350, 4.0, 'intermediate', ARRAY['ladder safety'], ARRAY['gutter guards', 'sealant', 'hangers'], 1.5, 'medium'),
(18, 'structural', 'Deck Repair', 'Fix loose boards, railings, or structural issues', 200, 800, 8.0, 'intermediate', ARRAY['carpentry', 'structural assessment'], ARRAY['deck boards', 'screws', 'brackets'], 1.2, 'medium'),
(19, 'electrical', 'GFCI Outlet Installation', 'Install ground fault circuit interrupter outlets', 85, 250, 2.0, 'intermediate', ARRAY['electrical safety'], ARRAY['GFCI outlet', 'wire nuts'], 1.0, 'medium'),
(20, 'hvac', 'Ductwork Inspection & Sealing', 'Inspect and seal HVAC ductwork for efficiency', 200, 600, 6.0, 'intermediate', ARRAY['HVAC knowledge'], ARRAY['duct sealant', 'insulation'], 1.0, 'low'),

-- Problems #21-30: Renovation Projects
(21, 'kitchen', 'Kitchen Faucet Upgrade', 'Replace kitchen faucet with modern fixture', 150, 500, 3.0, 'intermediate', ARRAY['plumbing'], ARRAY['faucet', 'supply lines', 'plumber''s putty'], 1.0, 'low'),
(22, 'bathroom', 'Toilet Replacement', 'Remove old toilet and install new unit', 200, 600, 4.0, 'intermediate', ARRAY['plumbing'], ARRAY['toilet', 'wax ring', 'bolts'], 1.0, 'medium'),
(23, 'bathroom', 'Bathroom Vanity Installation', 'Install new bathroom vanity with countertop', 300, 1200, 6.0, 'intermediate', ARRAY['carpentry', 'plumbing'], ARRAY['vanity', 'countertop', 'faucet'], 1.0, 'low'),
(24, 'flooring', 'Hardwood Floor Refinishing', 'Sand and refinish existing hardwood floors', 800, 2500, 20.0, 'advanced', ARRAY['floor sanding', 'finishing'], ARRAY['sandpaper', 'wood stain', 'polyurethane'], 1.1, 'low'),
(25, 'kitchen', 'Kitchen Backsplash Installation', 'Install tile backsplash behind kitchen counters', 300, 1000, 8.0, 'intermediate', ARRAY['tiling'], ARRAY['tiles', 'grout', 'adhesive'], 1.0, 'low'),
(26, 'bathroom', 'Shower/Tub Surrounds', 'Install tile or panel surrounds for shower/tub', 500, 1800, 12.0, 'advanced', ARRAY['tiling', 'waterproofing'], ARRAY['tiles', 'waterproof membrane', 'grout'], 1.0, 'low'),
(27, 'interior', 'Interior Painting', 'Paint interior walls, ceilings, and trim', 400, 1500, 16.0, 'beginner', ARRAY['painting'], ARRAY['paint', 'brushes', 'rollers', 'primer'], 1.1, 'low'),
(28, 'flooring', 'Laminate Flooring Installation', 'Install click-lock laminate flooring', 600, 2000, 12.0, 'intermediate', ARRAY['measuring', 'cutting'], ARRAY['laminate planks', 'underlayment', 'trim'], 1.0, 'low'),
(29, 'kitchen', 'Countertop Replacement', 'Remove old and install new kitchen countertops', 800, 3000, 10.0, 'advanced', ARRAY['measuring', 'cutting', 'installation'], ARRAY['countertop material', 'adhesive', 'supports'], 1.0, 'low'),
(30, 'bathroom', 'Bathroom Tile Work', 'Install new floor and wall tiles in bathroom', 600, 2200, 16.0, 'advanced', ARRAY['tiling', 'waterproofing'], ARRAY['tiles', 'grout', 'adhesive', 'waterproofing'], 1.0, 'low'),

-- Problems #31-40: Specialized Services
(31, 'roofing', 'Roof Leak Repair', 'Locate and repair roof leaks and damaged shingles', 200, 800, 4.0, 'advanced', ARRAY['roofing', 'safety'], ARRAY['shingles', 'roofing cement', 'flashing'], 1.8, 'high'),
(32, 'structural', 'Foundation Crack Repair', 'Seal foundation cracks and waterproofing', 300, 1500, 6.0, 'advanced', ARRAY['masonry', 'waterproofing'], ARRAY['hydraulic cement', 'sealants'], 1.0, 'high'),
(33, 'exterior', 'Siding Repair & Replacement', 'Repair or replace damaged exterior siding', 400, 1800, 10.0, 'intermediate', ARRAY['carpentry', 'weatherproofing'], ARRAY['siding materials', 'trim', 'caulk'], 1.3, 'medium'),
(34, 'electrical', 'Electrical Panel Upgrade', 'Upgrade main electrical panel and circuits', 1200, 3500, 8.0, 'expert', ARRAY['electrical codes', 'permits'], ARRAY['electrical panel', 'breakers', 'wire'], 1.0, 'high'),
(35, 'plumbing', 'Pipe Replacement', 'Replace old galvanized or copper pipes', 800, 3000, 12.0, 'advanced', ARRAY['plumbing', 'soldering'], ARRAY['pipes', 'fittings', 'solder'], 1.0, 'high'),
(36, 'hvac', 'HVAC System Installation', 'Install new heating and cooling system', 3000, 8000, 16.0, 'expert', ARRAY['HVAC certification', 'refrigeration'], ARRAY['HVAC unit', 'ductwork', 'refrigerant'], 1.4, 'high'),
(37, 'exterior', 'Deck Construction', 'Build new outdoor deck with railings', 1500, 5000, 24.0, 'advanced', ARRAY['carpentry', 'structural'], ARRAY['lumber', 'hardware', 'concrete'], 1.3, 'low'),
(38, 'landscaping', 'Irrigation System Installation', 'Install sprinkler system for lawn and gardens', 800, 2500, 12.0, 'intermediate', ARRAY['irrigation', 'trenching'], ARRAY['pipes', 'sprinkler heads', 'timer'], 1.5, 'low'),
(39, 'emergency', 'Emergency Water Damage', 'Emergency response to flooding and water damage', 500, 3000, 8.0, 'intermediate', ARRAY['water extraction', 'drying'], ARRAY['pumps', 'dehumidifiers', 'fans'], 1.0, 'critical'),
(40, 'emergency', 'Emergency Electrical Repair', 'Emergency electrical repairs for safety hazards', 200, 1000, 3.0, 'expert', ARRAY['electrical safety', 'emergency response'], ARRAY['electrical components'], 1.0, 'critical');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_felix_problems_category ON felix_problems(category);
CREATE INDEX IF NOT EXISTS idx_felix_problems_difficulty ON felix_problems(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_felix_problems_emergency ON felix_problems(emergency_priority);
CREATE INDEX IF NOT EXISTS idx_felix_problems_cost ON felix_problems(typical_cost_min, typical_cost_max);
