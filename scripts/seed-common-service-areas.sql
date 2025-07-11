-- Common Service Areas for Contractor Onboarding
-- Covers major US metropolitan areas, cities, and regions contractors commonly serve

-- Clear existing data
TRUNCATE common_service_areas RESTART IDENTITY CASCADE;

-- Insert major metropolitan areas across the US
INSERT INTO common_service_areas (area_name, area_type, state_code, center_coordinates, typical_radius_miles, population_estimate) VALUES

-- California Metro Areas
('San Francisco Bay Area', 'metro_area', 'CA', POINT(-122.4194, 37.7749), 35, 7750000),
('Los Angeles Metro', 'metro_area', 'CA', POINT(-118.2437, 34.0522), 40, 13200000),
('San Diego Metro', 'metro_area', 'CA', POINT(-117.1611, 32.7157), 30, 3300000),
('Sacramento Metro', 'metro_area', 'CA', POINT(-121.4944, 38.5816), 25, 2400000),
('Fresno Metro', 'metro_area', 'CA', POINT(-119.7871, 36.7378), 25, 1000000),

-- Texas Metro Areas
('Dallas-Fort Worth Metroplex', 'metro_area', 'TX', POINT(-96.7970, 32.7767), 40, 7600000),
('Houston Metro', 'metro_area', 'TX', POINT(-95.3698, 29.7604), 35, 7100000),
('San Antonio Metro', 'metro_area', 'TX', POINT(-98.4936, 29.4241), 30, 2500000),
('Austin Metro', 'metro_area', 'TX', POINT(-97.7431, 30.2672), 25, 2300000),

-- Florida Metro Areas
('Miami-Dade Metro', 'metro_area', 'FL', POINT(-80.1918, 25.7617), 30, 6100000),
('Tampa Bay Area', 'metro_area', 'FL', POINT(-82.4572, 27.9506), 25, 3200000),
('Orlando Metro', 'metro_area', 'FL', POINT(-81.3792, 28.5383), 25, 2600000),
('Jacksonville Metro', 'metro_area', 'FL', POINT(-81.6557, 30.3322), 25, 1600000),

-- New York Metro Areas
('New York City Metro', 'metro_area', 'NY', POINT(-74.0060, 40.7128), 30, 20100000),
('Albany-Schenectady-Troy', 'metro_area', 'NY', POINT(-73.6370, 42.6526), 20, 900000),
('Buffalo-Niagara Falls', 'metro_area', 'NY', POINT(-78.8784, 42.8864), 20, 1100000),

-- Illinois Metro Areas
('Chicago Metro', 'metro_area', 'IL', POINT(-87.6298, 41.8781), 35, 9500000),
('Rockford Metro', 'metro_area', 'IL', POINT(-89.0940, 42.2711), 15, 340000),

-- Pennsylvania Metro Areas
('Philadelphia Metro', 'metro_area', 'PA', POINT(-75.1652, 39.9526), 30, 6100000),
('Pittsburgh Metro', 'metro_area', 'PA', POINT(-79.9959, 40.4406), 25, 2300000),

-- Ohio Metro Areas
('Columbus Metro', 'metro_area', 'OH', POINT(-82.9988, 39.9612), 25, 2100000),
('Cleveland Metro', 'metro_area', 'OH', POINT(-81.6944, 41.4993), 25, 2000000),
('Cincinnati Metro', 'metro_area', 'OH', POINT(-84.5120, 39.1031), 25, 2200000),

-- Georgia Metro Areas
('Atlanta Metro', 'metro_area', 'GA', POINT(-84.3880, 33.7490), 35, 6000000),
('Savannah Metro', 'metro_area', 'GA', POINT(-81.0912, 32.0835), 20, 390000),

-- North Carolina Metro Areas
('Charlotte Metro', 'metro_area', 'NC', POINT(-80.8431, 35.2271), 25, 2600000),
('Raleigh-Durham Triangle', 'metro_area', 'NC', POINT(-78.6382, 35.7796), 25, 2100000),

-- Washington State Metro Areas
('Seattle Metro', 'metro_area', 'WA', POINT(-122.3301, 47.6062), 30, 4000000),
('Spokane Metro', 'metro_area', 'WA', POINT(-117.4260, 47.6587), 20, 560000),

-- Colorado Metro Areas
('Denver Metro', 'metro_area', 'CO', POINT(-104.9903, 39.7392), 30, 2900000),
('Colorado Springs Metro', 'metro_area', 'CO', POINT(-104.8214, 38.8339), 20, 740000),

-- Arizona Metro Areas
('Phoenix Metro', 'metro_area', 'AZ', POINT(-112.0740, 33.4484), 35, 5000000),
('Tucson Metro', 'metro_area', 'AZ', POINT(-110.9265, 32.2226), 25, 1000000),

-- Nevada Metro Areas
('Las Vegas Metro', 'metro_area', 'NV', POINT(-115.1398, 36.1699), 25, 2300000),
('Reno Metro', 'metro_area', 'NV', POINT(-119.7674, 39.5296), 20, 460000),

-- Oregon Metro Areas
('Portland Metro', 'metro_area', 'OR', POINT(-122.6750, 45.5152), 25, 2500000),
('Eugene Metro', 'metro_area', 'OR', POINT(-123.0351, 44.0521), 15, 380000),

-- Utah Metro Areas
('Salt Lake City Metro', 'metro_area', 'UT', POINT(-111.8910, 40.7608), 25, 1200000),

-- Massachusetts Metro Areas
('Boston Metro', 'metro_area', 'MA', POINT(-71.0589, 42.3601), 25, 4900000),

-- Maryland Metro Areas
('Baltimore Metro', 'metro_area', 'MD', POINT(-76.6122, 39.2904), 25, 2800000),

-- Virginia Metro Areas
('Virginia Beach-Norfolk Metro', 'metro_area', 'VA', POINT(-76.2859, 36.8508), 25, 1800000),
('Richmond Metro', 'metro_area', 'VA', POINT(-77.4360, 37.5407), 20, 1300000),

-- Michigan Metro Areas
('Detroit Metro', 'metro_area', 'MI', POINT(-83.0458, 42.3314), 30, 4300000),
('Grand Rapids Metro', 'metro_area', 'MI', POINT(-85.6681, 42.9634), 20, 1100000),

-- Wisconsin Metro Areas
('Milwaukee Metro', 'metro_area', 'WI', POINT(-87.9065, 43.0389), 20, 1600000),

-- Minnesota Metro Areas
('Minneapolis-St. Paul Metro', 'metro_area', 'MN', POINT(-93.2650, 44.9778), 30, 3700000),

-- Missouri Metro Areas
('Kansas City Metro', 'metro_area', 'MO', POINT(-94.5786, 39.0997), 25, 2200000),
('St. Louis Metro', 'metro_area', 'MO', POINT(-90.1994, 38.6270), 25, 2800000),

-- Tennessee Metro Areas
('Nashville Metro', 'metro_area', 'TN', POINT(-86.7816, 36.1627), 25, 2000000),
('Memphis Metro', 'metro_area', 'TN', POINT(-90.0490, 35.1495), 25, 1300000),

-- Louisiana Metro Areas
('New Orleans Metro', 'metro_area', 'LA', POINT(-90.0715, 29.9511), 25, 1300000),

-- Oklahoma Metro Areas
('Oklahoma City Metro', 'metro_area', 'OK', POINT(-97.5164, 35.4676), 25, 1400000),

-- Arkansas Metro Areas
('Little Rock Metro', 'metro_area', 'AR', POINT(-92.2896, 34.7465), 20, 730000),

-- Kentucky Metro Areas
('Louisville Metro', 'metro_area', 'KY', POINT(-85.7585, 38.2527), 20, 1300000),

-- South Carolina Metro Areas
('Charleston Metro', 'metro_area', 'SC', POINT(-79.9311, 32.7765), 20, 800000),

-- Alabama Metro Areas
('Birmingham Metro', 'metro_area', 'AL', POINT(-86.8025, 33.5207), 20, 1100000),

-- New Mexico Metro Areas
('Albuquerque Metro', 'metro_area', 'NM', POINT(-106.6504, 35.0844), 20, 920000),

-- Hawaii Metro Areas
('Honolulu Metro', 'metro_area', 'HI', POINT(-157.8583, 21.3099), 15, 1000000),

-- Alaska Metro Areas
('Anchorage Metro', 'metro_area', 'AK', POINT(-149.9003, 61.2181), 20, 400000);

-- Add sample custom region structure for contractors who need specific coverage
INSERT INTO common_service_areas (area_name, area_type, state_code, center_coordinates, typical_radius_miles, population_estimate) VALUES
('Custom Service Area', 'custom', '--', POINT(0, 0), 25, 0);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_common_areas_search ON common_service_areas(area_name, state_code);
