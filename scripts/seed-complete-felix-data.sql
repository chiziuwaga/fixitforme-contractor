-- Complete Felix 40-Problem Framework Data
-- This script converts the felix-40-problems.json into SQL INSERT statements

-- Clear existing data
TRUNCATE felix_problems RESTART IDENTITY CASCADE;

-- Insert all 40 Felix problems
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
(12, 'drywall', 'Drywall Hole Repair', 'Patch holes in walls from nails, screws, or damage', 35, 150, 2.0, 'intermediate', ARRAY['drywall work'], ARRAY['drywall patch', 'joint compound', 'sandpaper'], 1.0, 'low'),
(13, 'electrical', 'Circuit Breaker Replacement', 'Replace faulty circuit breaker in electrical panel', 75, 300, 1.5, 'advanced', ARRAY['electrical safety', 'electrical codes'], ARRAY['circuit breaker'], 1.0, 'high'),
(14, 'plumbing', 'Garbage Disposal Installation', 'Install or replace kitchen garbage disposal unit', 150, 450, 3.0, 'intermediate', ARRAY['plumbing', 'electrical'], ARRAY['disposal unit', 'mounting assembly'], 1.0, 'medium'),
(15, 'hvac', 'Ceiling Fan Installation', 'Install ceiling fan with light fixture', 100, 400, 3.0, 'intermediate', ARRAY['electrical', 'mounting'], ARRAY['ceiling fan', 'mounting box', 'wire nuts'], 1.0, 'low'),
(16, 'plumbing', 'Water Heater Repair', 'Fix water heater issues - heating elements, thermostats', 150, 600, 4.0, 'advanced', ARRAY['plumbing', 'electrical'], ARRAY['heating elements', 'thermostats'], 1.0, 'high'),
(17, 'exterior', 'Gutter Cleaning & Repair', 'Clean gutters and repair loose or damaged sections', 100, 350, 4.0, 'intermediate', ARRAY['ladder safety'], ARRAY['gutter guards', 'sealant', 'hangers'], 1.5, 'medium'),
(18, 'carpentry', 'Deck Repair', 'Fix loose boards, railings, or structural issues', 200, 800, 8.0, 'intermediate', ARRAY['carpentry', 'structural assessment'], ARRAY['deck boards', 'screws', 'brackets'], 1.2, 'medium'),
(19, 'electrical', 'GFCI Outlet Installation', 'Install ground fault circuit interrupter outlets', 85, 250, 2.0, 'intermediate', ARRAY['electrical safety'], ARRAY['GFCI outlet', 'wire nuts'], 1.0, 'medium'),
(20, 'hvac', 'Ductwork Inspection & Sealing', 'Inspect and seal HVAC ductwork for efficiency', 200, 600, 6.0, 'intermediate', ARRAY['HVAC knowledge'], ARRAY['duct sealant', 'insulation'], 1.0, 'low'),

-- Problems #21-30: Renovation Projects
(21, 'flooring', 'Hardwood Floor Refinishing', 'Sand and refinish hardwood floors to restore appearance', 500, 1500, 16.0, 'advanced', ARRAY['floor sanding', 'finishing'], ARRAY['sandpaper', 'stain', 'polyurethane'], 1.0, 'low'),
(22, 'carpentry', 'Kitchen Cabinet Installation', 'Install new kitchen cabinets and hardware', 800, 3000, 24.0, 'advanced', ARRAY['carpentry', 'measuring', 'mounting'], ARRAY['cabinets', 'screws', 'shims', 'hardware'], 1.0, 'low'),
(23, 'plumbing', 'Bathroom Renovation - Plumbing', 'Update bathroom plumbing for renovation project', 600, 2500, 20.0, 'advanced', ARRAY['plumbing', 'permits'], ARRAY['pipes', 'fittings', 'fixtures'], 1.0, 'medium'),
(24, 'flooring', 'Tile Floor Installation', 'Install ceramic or stone tile flooring', 400, 1200, 12.0, 'intermediate', ARRAY['tiling', 'layout'], ARRAY['tiles', 'adhesive', 'grout', 'spacers'], 1.0, 'low'),
(25, 'electrical', 'Electrical Panel Upgrade', 'Upgrade electrical panel for increased capacity', 800, 2500, 8.0, 'advanced', ARRAY['electrical codes', 'permits'], ARRAY['electrical panel', 'breakers', 'wire'], 1.0, 'high'),
(26, 'carpentry', 'Staircase Repair', 'Repair or replace damaged staircase components', 300, 1000, 12.0, 'advanced', ARRAY['carpentry', 'structural work'], ARRAY['lumber', 'brackets', 'stain'], 1.0, 'medium'),
(27, 'roofing', 'Roof Shingle Replacement', 'Replace damaged or missing roof shingles', 300, 800, 8.0, 'intermediate', ARRAY['roofing', 'ladder safety'], ARRAY['shingles', 'nails', 'underlayment'], 1.3, 'medium'),
(28, 'hvac', 'Central Air Installation', 'Install central air conditioning system', 2000, 6000, 16.0, 'advanced', ARRAY['HVAC', 'electrical', 'permits'], ARRAY['AC unit', 'ductwork', 'refrigerant'], 1.4, 'low'),
(29, 'plumbing', 'Whole House Repiping', 'Replace old plumbing throughout entire house', 3000, 8000, 40.0, 'advanced', ARRAY['plumbing', 'permits'], ARRAY['pipes', 'fittings', 'fixtures'], 1.0, 'high'),
(30, 'carpentry', 'Room Addition Framing', 'Frame new room addition or extension', 2000, 6000, 60.0, 'advanced', ARRAY['framing', 'permits', 'foundation'], ARRAY['lumber', 'fasteners', 'insulation'], 1.1, 'low'),

-- Problems #31-40: Specialized Services
(31, 'roofing', 'Emergency Roof Leak Repair', 'Emergency repair of active roof leaks', 200, 800, 4.0, 'intermediate', ARRAY['roofing', 'emergency response'], ARRAY['tarps', 'sealant', 'patches'], 1.0, 'high'),
(32, 'electrical', 'Generator Installation', 'Install backup generator system for home', 1500, 5000, 12.0, 'advanced', ARRAY['electrical', 'permits', 'gas connections'], ARRAY['generator', 'transfer switch', 'gas line'], 1.0, 'medium'),
(33, 'plumbing', 'Sewer Line Repair', 'Repair or replace damaged sewer lines', 1000, 4000, 16.0, 'advanced', ARRAY['excavation', 'permits'], ARRAY['pipe', 'fittings', 'backfill'], 1.0, 'high'),
(34, 'hvac', 'Boiler System Repair', 'Repair or service home boiler heating system', 300, 1200, 6.0, 'advanced', ARRAY['boiler systems', 'gas safety'], ARRAY['boiler parts', 'fittings', 'controls'], 1.2, 'high'),
(35, 'carpentry', 'Foundation Repair', 'Repair foundation cracks or settlement issues', 1500, 6000, 24.0, 'advanced', ARRAY['foundation work', 'structural'], ARRAY['concrete', 'rebar', 'waterproofing'], 1.0, 'high'),
(36, 'roofing', 'Skylight Installation', 'Install new skylights in roof', 400, 1200, 8.0, 'advanced', ARRAY['roofing', 'waterproofing'], ARRAY['skylight', 'flashing', 'sealant'], 1.1, 'medium'),
(37, 'electrical', 'Smart Home Wiring', 'Install smart home automation wiring and systems', 800, 3000, 16.0, 'advanced', ARRAY['low voltage', 'networking'], ARRAY['smart devices', 'low voltage wire', 'hubs'], 1.0, 'low'),
(38, 'plumbing', 'Water Filtration System', 'Install whole-house water filtration system', 500, 2000, 6.0, 'intermediate', ARRAY['plumbing', 'filtration'], ARRAY['filter system', 'pipes', 'fittings'], 1.0, 'low'),
(39, 'hvac', 'Radiant Floor Heating', 'Install radiant floor heating system', 1200, 4000, 20.0, 'advanced', ARRAY['HVAC', 'flooring'], ARRAY['heating coils', 'controls', 'insulation'], 1.0, 'low'),
(40, 'exterior', 'Solar Panel Installation', 'Install residential solar panel system', 8000, 20000, 32.0, 'advanced', ARRAY['electrical', 'roofing', 'permits'], ARRAY['solar panels', 'inverters', 'mounting'], 1.0, 'low');

-- Update sequence for felix_problems if needed
SELECT setval('felix_problems_id_seq', (SELECT MAX(id) FROM felix_problems));
