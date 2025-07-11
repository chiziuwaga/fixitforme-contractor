-- Run this in Supabase Dashboard > SQL Editor
-- Felix 40-Problem Framework Data

-- Clear existing data if any
DELETE FROM felix_problems;

-- Insert all 40 Felix problems with simpler structure
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

-- Verify the data was inserted
SELECT COUNT(*) as total_problems FROM felix_problems;
SELECT category, COUNT(*) as count FROM felix_problems GROUP BY category ORDER BY category;
