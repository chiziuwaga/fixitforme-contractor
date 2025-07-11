-- Dynamic Service Areas Seeding Data
-- Starting with major US metropolitan areas, easily expandable

INSERT INTO service_areas (area_name, area_type, state_code, county, coordinates, population, market_size) VALUES

-- California - Bay Area
('San Francisco', 'city', 'CA', 'San Francisco County', POINT(-122.4194, 37.7749), 873965, 'metro'),
('Oakland', 'city', 'CA', 'Alameda County', POINT(-122.2711, 37.8044), 433031, 'large'),
('San Jose', 'city', 'CA', 'Santa Clara County', POINT(-121.8863, 37.3382), 1035317, 'metro'),
('Palo Alto', 'city', 'CA', 'Santa Clara County', POINT(-122.1430, 37.4419), 68572, 'medium'),
('Berkeley', 'city', 'CA', 'Alameda County', POINT(-122.2585, 37.8715), 124321, 'medium'),
('Fremont', 'city', 'CA', 'Alameda County', POINT(-121.9886, 37.5485), 230504, 'large'),
('San Mateo', 'city', 'CA', 'San Mateo County', POINT(-122.3255, 37.5630), 107376, 'medium'),

-- California - Los Angeles Area  
('Los Angeles', 'city', 'CA', 'Los Angeles County', POINT(-118.2437, 34.0522), 3898747, 'metro'),
('Santa Monica', 'city', 'CA', 'Los Angeles County', POINT(-118.4912, 34.0195), 93076, 'large'),
('Beverly Hills', 'city', 'CA', 'Los Angeles County', POINT(-118.4004, 34.0736), 32701, 'large'),
('Pasadena', 'city', 'CA', 'Los Angeles County', POINT(-118.1445, 34.1478), 138699, 'large'),

-- New York Area
('New York', 'city', 'NY', 'New York County', POINT(-74.0060, 40.7128), 8336817, 'metro'),
('Brooklyn', 'city', 'NY', 'Kings County', POINT(-73.9442, 40.6782), 2736074, 'metro'),
('Queens', 'city', 'NY', 'Queens County', POINT(-73.7949, 40.7282), 2405464, 'metro'),
('Manhattan', 'city', 'NY', 'New York County', POINT(-73.9712, 40.7831), 1694251, 'metro'),

-- Texas - Major Cities
('Houston', 'city', 'TX', 'Harris County', POINT(-95.3698, 29.7604), 2320268, 'metro'),
('Dallas', 'city', 'TX', 'Dallas County', POINT(-96.7970, 32.7767), 1343573, 'metro'),
('Austin', 'city', 'TX', 'Travis County', POINT(-97.7431, 30.2672), 965872, 'metro'),
('San Antonio', 'city', 'TX', 'Bexar County', POINT(-98.4936, 29.4241), 1547253, 'metro'),

-- Florida - Major Cities
('Miami', 'city', 'FL', 'Miami-Dade County', POINT(-80.1918, 25.7617), 467963, 'metro'),
('Orlando', 'city', 'FL', 'Orange County', POINT(-81.3792, 28.5383), 307573, 'large'),
('Tampa', 'city', 'FL', 'Hillsborough County', POINT(-82.4572, 27.9506), 399700, 'large'),
('Jacksonville', 'city', 'FL', 'Duval County', POINT(-81.6557, 30.3322), 949611, 'large'),

-- Illinois - Chicago Area
('Chicago', 'city', 'IL', 'Cook County', POINT(-87.6298, 41.8781), 2693976, 'metro'),
('Naperville', 'city', 'IL', 'DuPage County', POINT(-88.1473, 41.7858), 148449, 'large'),

-- Washington State - Seattle Area
('Seattle', 'city', 'WA', 'King County', POINT(-122.3321, 47.6062), 749256, 'metro'),
('Bellevue', 'city', 'WA', 'King County', POINT(-122.2015, 47.6101), 151854, 'large'),

-- Colorado - Denver Area
('Denver', 'city', 'CO', 'Denver County', POINT(-104.9903, 39.7392), 715522, 'metro'),
('Boulder', 'city', 'CO', 'Boulder County', POINT(-105.2705, 40.0150), 108250, 'medium'),

-- Massachusetts - Boston Area
('Boston', 'city', 'MA', 'Suffolk County', POINT(-71.0589, 42.3601), 695506, 'metro'),
('Cambridge', 'city', 'MA', 'Middlesex County', POINT(-71.0956, 42.3736), 118403, 'large'),

-- Arizona - Phoenix Area
('Phoenix', 'city', 'AZ', 'Maricopa County', POINT(-112.0740, 33.4484), 1680992, 'metro'),
('Scottsdale', 'city', 'AZ', 'Maricopa County', POINT(-111.9261, 33.4942), 258269, 'large'),

-- Georgia - Atlanta Area
('Atlanta', 'city', 'GA', 'Fulton County', POINT(-84.3880, 33.7490), 498715, 'metro'),

-- Regional Coverage Areas (for broader service contractors)
('Bay Area', 'region', 'CA', 'Multi-County', POINT(-122.2711, 37.8044), 7753000, 'metro'),
('Greater Los Angeles', 'region', 'CA', 'Multi-County', POINT(-118.2437, 34.0522), 13200000, 'metro'),
('Tri-State Area', 'region', 'NY', 'Multi-State', POINT(-74.0060, 40.7128), 20000000, 'metro'),
('DFW Metroplex', 'region', 'TX', 'Multi-County', POINT(-96.7970, 32.7767), 7600000, 'metro'),
('South Florida', 'region', 'FL', 'Multi-County', POINT(-80.1918, 25.7617), 6200000, 'metro');

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_service_areas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_areas_updated_at
    BEFORE UPDATE ON service_areas
    FOR EACH ROW
    EXECUTE FUNCTION update_service_areas_updated_at();
