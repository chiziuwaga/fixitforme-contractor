-- Complete Felix 40-Problem Framework Data
-- This script inserts all 40 Felix problems into the database

-- Clear existing data
TRUNCATE felix_problems RESTART IDENTITY CASCADE;

-- Insert all 40 Felix problems
INSERT INTO felix_problems (id, category, problem_name, description, difficulty_level, avg_cost_min, avg_cost_max, typical_timeline, required_materials, common_tools, safety_considerations) VALUES

-- Problems #1-10: Basic Repairs & Maintenance
(1, 'plumbing', 'Running Toilet Repair', 'Fix toilet that continuously runs or won''t stop filling', 1, 15.00, 75.00, '30 minutes', '["flapper", "chain", "fill valve"]', '["adjustable wrench", "pliers"]', '["turn off water supply", "wear gloves"]'),
(2, 'plumbing', 'Leaky Faucet Fix', 'Repair dripping faucet in kitchen or bathroom', 1, 25.00, 150.00, '1 hour', '["O-rings", "washers", "cartridge"]', '["adjustable wrench", "screwdriver"]', '["turn off water supply"]'),
(3, 'plumbing', 'Clogged Drain Clearing', 'Clear blocked sink, tub, or shower drain', 1, 35.00, 200.00, '1-2 hours', '["drain snake", "plunger", "drain cleaner"]', '["plunger", "drain snake"]', '["wear gloves", "ventilation for chemicals"]'),
(4, 'electrical', 'Light Fixture Replacement', 'Install new ceiling or wall light fixture', 2, 45.00, 250.00, '2 hours', '["fixture", "wire nuts", "electrical box"]', '["wire strippers", "screwdriver", "voltage tester"]', '["turn off power at breaker", "test wires"]'),
(5, 'electrical', 'Electrical Outlet Repair', 'Fix non-working electrical outlet or GFCI', 2, 35.00, 150.00, '1 hour', '["outlet", "wire nuts", "electrical tape"]', '["voltage tester", "screwdriver"]', '["turn off power", "test for live wires"]'),
(6, 'hvac', 'Thermostat Installation', 'Install programmable or smart thermostat', 2, 65.00, 300.00, '1-2 hours', '["thermostat", "wire nuts"]', '["drill", "level", "wire strippers"]', '["turn off power to HVAC"]'),
(7, 'carpentry', 'Cabinet Door Repair', 'Fix loose, misaligned, or broken cabinet doors', 1, 25.00, 150.00, '2 hours', '["hinges", "screws", "wood glue"]', '["screwdriver", "drill", "clamps"]', '["wear safety glasses"]'),
(8, 'exterior', 'Window Screen Repair', 'Replace torn screen mesh or fix frame', 1, 20.00, 100.00, '1 hour', '["screen mesh", "spline", "frame"]', '["spline roller", "utility knife"]', '["handle tools carefully"]'),
(9, 'carpentry', 'Door Lock Replacement', 'Install new deadbolt or door handle set', 2, 45.00, 200.00, '1-2 hours', '["lock set", "drill bits"]', '["drill", "chisel", "measuring tape"]', '["secure door while working"]'),
(10, 'flooring', 'Tile Grout Repair', 'Re-grout bathroom or kitchen tiles', 2, 30.00, 180.00, '3 hours', '["grout", "grout float", "sealant"]', '["grout float", "sponge", "bucket"]', '["ventilation", "knee protection"]'),

-- Problems #11-20: System Work & Upgrades  
(11, 'hvac', 'HVAC Filter Replacement', 'Replace air conditioning and heating filters', 1, 25.00, 100.00, '30 minutes', '["HVAC filters"]', '["screwdriver"]', '["turn off system"]'),
(12, 'drywall', 'Drywall Hole Repair', 'Patch holes in walls from nails, screws, or damage', 2, 35.00, 150.00, '2 hours', '["drywall patch", "joint compound", "sandpaper"]', '["putty knife", "sanding block"]', '["dust mask", "ventilation"]'),
(13, 'electrical', 'Circuit Breaker Replacement', 'Replace faulty circuit breaker in electrical panel', 4, 75.00, 300.00, '1-2 hours', '["circuit breaker"]', '["insulated tools", "voltage tester"]', '["main breaker off", "electrical safety gear"]'),
(14, 'plumbing', 'Garbage Disposal Installation', 'Install or replace kitchen garbage disposal unit', 3, 150.00, 450.00, '3 hours', '["disposal unit", "mounting assembly"]', '["adjustable wrench", "wire nuts"]', '["turn off power and water"]'),
(15, 'hvac', 'Ceiling Fan Installation', 'Install ceiling fan with light fixture', 3, 100.00, 400.00, '3 hours', '["ceiling fan", "mounting box", "wire nuts"]', '["drill", "wire strippers", "ladder"]', '["turn off power", "secure ladder"]'),
(16, 'plumbing', 'Water Heater Repair', 'Fix water heater issues - heating elements, thermostats', 4, 150.00, 600.00, '4 hours', '["heating elements", "thermostats"]', '["multimeter", "element wrench"]', '["turn off power and water", "drain tank"]'),
(17, 'exterior', 'Gutter Cleaning & Repair', 'Clean gutters and repair loose or damaged sections', 2, 100.00, 350.00, '4 hours', '["gutter guards", "sealant", "hangers"]', '["ladder", "gloves", "hose"]', '["ladder safety", "weather conditions"]'),
(18, 'carpentry', 'Deck Repair', 'Fix loose boards, railings, or structural issues', 3, 200.00, 800.00, '8 hours', '["deck boards", "screws", "brackets"]', '["drill", "saw", "level"]', '["structural assessment", "fall protection"]'),
(19, 'electrical', 'GFCI Outlet Installation', 'Install ground fault circuit interrupter outlets', 2, 85.00, 250.00, '2 hours', '["GFCI outlet", "wire nuts"]', '["voltage tester", "wire strippers"]', '["turn off power", "test circuit"]'),
(20, 'hvac', 'Ductwork Inspection & Sealing', 'Inspect and seal HVAC ductwork for efficiency', 3, 200.00, 600.00, '6 hours', '["duct sealant", "insulation"]', '["flashlight", "brush", "caulk gun"]', '["attic/crawlspace safety"]'),

-- Problems #21-30: Renovation Projects
(21, 'flooring', 'Hardwood Floor Refinishing', 'Sand and refinish hardwood floors to restore appearance', 4, 500.00, 1500.00, '2-3 days', '["sandpaper", "stain", "polyurethane"]', '["floor sander", "edger", "brushes"]', '["dust mask", "ventilation", "chemical safety"]'),
(22, 'carpentry', 'Kitchen Cabinet Installation', 'Install new kitchen cabinets and hardware', 4, 800.00, 3000.00, '3 days', '["cabinets", "screws", "shims", "hardware"]', '["drill", "level", "stud finder"]', '["lifting techniques", "secure mounting"]'),
(23, 'plumbing', 'Bathroom Renovation - Plumbing', 'Update bathroom plumbing for renovation project', 4, 600.00, 2500.00, '2-3 days', '["pipes", "fittings", "fixtures"]', '["pipe cutter", "torch", "wrenches"]', '["gas safety", "permits required"]'),
(24, 'flooring', 'Tile Floor Installation', 'Install ceramic or stone tile flooring', 3, 400.00, 1200.00, '2 days', '["tiles", "adhesive", "grout", "spacers"]', '["tile cutter", "trowel", "float"]', '["knee protection", "dust mask"]'),
(25, 'electrical', 'Electrical Panel Upgrade', 'Upgrade electrical panel for increased capacity', 5, 800.00, 2500.00, '1 day', '["electrical panel", "breakers", "wire"]', '["insulated tools", "multimeter"]', '["permit required", "utility coordination"]'),
(26, 'carpentry', 'Staircase Repair', 'Repair or replace damaged staircase components', 4, 300.00, 1000.00, '1-2 days', '["lumber", "brackets", "stain"]', '["saw", "drill", "router"]', '["structural assessment", "fall protection"]'),
(27, 'roofing', 'Roof Shingle Replacement', 'Replace damaged or missing roof shingles', 3, 300.00, 800.00, '1 day', '["shingles", "nails", "underlayment"]', '["hammer", "utility knife", "chalk line"]', '["fall protection", "weather conditions"]'),
(28, 'hvac', 'Central Air Installation', 'Install central air conditioning system', 5, 2000.00, 6000.00, '2 days', '["AC unit", "ductwork", "refrigerant"]', '["gauges", "vacuum pump", "torch"]', '["refrigerant handling", "electrical safety"]'),
(29, 'plumbing', 'Whole House Repiping', 'Replace old plumbing throughout entire house', 5, 3000.00, 8000.00, '5 days', '["pipes", "fittings", "fixtures"]', '["pipe cutter", "torch", "threading machine"]', '["permits required", "water shutoff coordination"]'),
(30, 'carpentry', 'Room Addition Framing', 'Frame new room addition or extension', 5, 2000.00, 6000.00, '1 week', '["lumber", "fasteners", "insulation"]', '["saw", "drill", "level"]', '["permits required", "foundation inspection"]'),

-- Problems #31-40: Specialized Services
(31, 'roofing', 'Emergency Roof Leak Repair', 'Emergency repair of active roof leaks', 3, 200.00, 800.00, '4 hours', '["tarps", "sealant", "patches"]', '["ladder", "hammer", "utility knife"]', '["weather conditions", "emergency safety"]'),
(32, 'electrical', 'Generator Installation', 'Install backup generator system for home', 5, 1500.00, 5000.00, '1-2 days', '["generator", "transfer switch", "gas line"]', '["electrical tools", "gas tools"]', '["permits required", "gas safety"]'),
(33, 'plumbing', 'Sewer Line Repair', 'Repair or replace damaged sewer lines', 5, 1000.00, 4000.00, '2 days', '["pipe", "fittings", "backfill"]', '["excavator", "pipe tools"]', '["excavation safety", "permits required"]'),
(34, 'hvac', 'Boiler System Repair', 'Repair or service home boiler heating system', 4, 300.00, 1200.00, '6 hours', '["boiler parts", "fittings", "controls"]', '["gauges", "wrenches", "multimeter"]', '["gas safety", "pressure testing"]'),
(35, 'carpentry', 'Foundation Repair', 'Repair foundation cracks or settlement issues', 5, 1500.00, 6000.00, '3 days', '["concrete", "rebar", "waterproofing"]', '["concrete mixer", "rebar cutter"]', '["structural assessment", "excavation safety"]'),
(36, 'roofing', 'Skylight Installation', 'Install new skylights in roof', 4, 400.00, 1200.00, '1 day', '["skylight", "flashing", "sealant"]', '["saw", "drill", "measuring tools"]', '["fall protection", "waterproofing"]'),
(37, 'electrical', 'Smart Home Wiring', 'Install smart home automation wiring and systems', 4, 800.00, 3000.00, '2 days', '["smart devices", "low voltage wire", "hubs"]', '["network tools", "wire strippers"]', '["electrical safety", "network planning"]'),
(38, 'plumbing', 'Water Filtration System', 'Install whole-house water filtration system', 3, 500.00, 2000.00, '6 hours', '["filter system", "pipes", "fittings"]', '["pipe cutter", "wrenches"]', '["water pressure testing"]'),
(39, 'hvac', 'Radiant Floor Heating', 'Install radiant floor heating system', 5, 1200.00, 4000.00, '2-3 days', '["heating coils", "controls", "insulation"]', '["tubing tools", "manifold"]', '["electrical safety", "pressure testing"]'),
(40, 'exterior', 'Solar Panel Installation', 'Install residential solar panel system', 5, 8000.00, 20000.00, '4 days', '["solar panels", "inverters", "mounting"]', '["electrical tools", "roofing tools"]', '["permits required", "electrical safety", "fall protection"]');

-- Update sequence if needed (PostgreSQL auto-increment)
SELECT setval(pg_get_serial_sequence('felix_problems', 'id'), (SELECT MAX(id) FROM felix_problems));
