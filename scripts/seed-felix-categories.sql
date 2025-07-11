-- Felix Categories Seeding Script
-- This script populates the felix_categories table with service categories derived from the 40-problem framework

INSERT INTO felix_categories (category_name, search_terms, value_threshold) VALUES
('plumbing', ARRAY['running toilet repair', 'leaky faucet fix', 'clogged drain', 'toilet flush mechanism', 'water heater repair', 'pipe leak', 'sump pump', 'garbage disposal', 'shower head replacement'], 150),
('electrical', ARRAY['light fixture replacement', 'electrical outlet', 'circuit breaker', 'ceiling fan installation', 'panel upgrade', 'GFCI outlet', 'electrical inspection', 'generator installation', 'smart switch'], 200),
('hvac', ARRAY['thermostat installation', 'heating repair', 'AC repair', 'ventilation', 'ductwork cleaning', 'heat pump service', 'furnace repair', 'air quality improvement'], 300),
('carpentry', ARRAY['cabinet repair', 'deck repair', 'handrail fix', 'door lock replacement', 'trim work', 'shelving installation', 'furniture repair', 'molding installation'], 175),
('roofing', ARRAY['roof leak repair', 'shingle replacement', 'gutter cleaning', 'emergency roof repair', 'roof inspection', 'skylight installation', 'chimney repair'], 500),
('drywall', ARRAY['drywall patching', 'hole in wall', 'crack repair', 'texture matching', 'ceiling repair', 'paint prep', 'wall installation'], 125),
('flooring', ARRAY['tile repair', 'hardwood refinishing', 'grout resealing', 'floor leveling', 'carpet repair', 'vinyl installation', 'subfloor repair'], 200),
('exterior', ARRAY['siding repair', 'deck staining', 'pressure washing', 'window screen repair', 'door replacement', 'weatherproofing', 'fence repair'], 250);

-- Insert sample felix_problems for testing (first 10 problems)
INSERT INTO felix_problems (id, category, title, description, typical_cost_min, typical_cost_max, typical_time_hours, difficulty_level, required_skills, common_materials, seasonal_factor, emergency_priority) VALUES
(1, 'plumbing', 'Running Toilet Repair', 'Fix toilet that continuously runs or won''t stop filling', 15, 75, 0.5, 'beginner', ARRAY['basic plumbing'], ARRAY['flapper', 'chain', 'fill valve'], 1.0, 'low'),
(2, 'plumbing', 'Leaky Faucet Fix', 'Repair dripping faucet in kitchen or bathroom', 25, 150, 1.0, 'beginner', ARRAY['basic plumbing'], ARRAY['O-rings', 'washers', 'cartridge'], 1.0, 'low'),
(3, 'plumbing', 'Clogged Drain Clearing', 'Clear blocked sink, tub, or shower drain', 35, 200, 1.5, 'beginner', ARRAY['basic plumbing'], ARRAY['drain snake', 'plunger', 'drain cleaner'], 1.0, 'medium'),
(4, 'electrical', 'Light Fixture Replacement', 'Install new ceiling or wall light fixture', 45, 250, 2.0, 'intermediate', ARRAY['electrical basics', 'wire nuts'], ARRAY['fixture', 'wire nuts', 'electrical box'], 1.0, 'low'),
(5, 'electrical', 'Electrical Outlet Repair', 'Fix non-working electrical outlet or GFCI', 35, 150, 1.0, 'intermediate', ARRAY['electrical safety'], ARRAY['outlet', 'wire nuts', 'electrical tape'], 1.0, 'medium'),
(6, 'hvac', 'Thermostat Installation', 'Install programmable or smart thermostat', 65, 300, 1.5, 'intermediate', ARRAY['electrical basics'], ARRAY['thermostat', 'wire nuts'], 1.0, 'low'),
(7, 'carpentry', 'Cabinet Door Repair', 'Fix loose, misaligned, or broken cabinet doors', 25, 150, 2.0, 'beginner', ARRAY['basic carpentry'], ARRAY['hinges', 'screws', 'wood glue'], 1.0, 'low'),
(8, 'exterior', 'Window Screen Repair', 'Replace torn screen mesh or fix frame', 20, 100, 1.0, 'beginner', ARRAY['basic tools'], ARRAY['screen mesh', 'spline', 'frame'], 1.2, 'low'),
(9, 'carpentry', 'Door Lock Replacement', 'Install new deadbolt or door handle set', 45, 200, 1.5, 'intermediate', ARRAY['drilling', 'measuring'], ARRAY['lock set', 'drill bits'], 1.0, 'medium'),
(10, 'flooring', 'Tile Grout Repair', 'Re-grout bathroom or kitchen tiles', 30, 180, 3.0, 'intermediate', ARRAY['tiling'], ARRAY['grout', 'grout float', 'sealant'], 1.0, 'low');
