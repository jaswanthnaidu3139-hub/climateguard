-- ClimateGuard AI — Seed Data
-- Coordinates for key supported locations in India (including Vijayawada, Hyderabad, Visakhapatnam, Bengaluru, Chennai, Mumbai, Delhi, Kolkata)

INSERT INTO locations (id, name, state, latitude, longitude, country, elevation, timezone)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Vijayawada', 'Andhra Pradesh', 16.5062, 80.6480, 'India', 11.0, 'Asia/Kolkata'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Hyderabad', 'Telangana', 17.3850, 78.4867, 'India', 542.0, 'Asia/Kolkata'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Visakhapatnam', 'Andhra Pradesh', 17.6868, 83.2185, 'India', 45.0, 'Asia/Kolkata'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Bengaluru', 'Karnataka', 12.9716, 77.5946, 'India', 920.0, 'Asia/Kolkata'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Chennai', 'Tamil Nadu', 13.0827, 80.2707, 'India', 6.0, 'Asia/Kolkata'),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Mumbai', 'Maharashtra', 19.0760, 72.8777, 'India', 14.0, 'Asia/Kolkata'),
    ('01eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Delhi', 'Delhi NCR', 28.6139, 77.2090, 'India', 216.0, 'Asia/Kolkata'),
    ('02eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'Kolkata', 'West Bengal', 22.5726, 88.3639, 'India', 9.0, 'Asia/Kolkata')
ON CONFLICT (name, state) DO UPDATE 
SET latitude = EXCLUDED.latitude, 
    longitude = EXCLUDED.longitude, 
    elevation = EXCLUDED.elevation;

-- Clearly labeled sample baseline risk assessment record (explicitly labeled demo)
INSERT INTO risk_assessments (
    id, location_id, assessed_at, heat_score, rainfall_score, dry_spell_score, overall_score, 
    risk_level, recommendations, contributing_factors, methodology_version, data_source
) VALUES (
    '11eebc99-9c0b-4ef8-bb6d-6bb9bd380a99',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    NOW() - INTERVAL '1 day',
    40.0,
    30.0,
    25.0,
    32.75,
    'Moderate',
    '[{"id": "rec-demo-1", "category": "heat", "title": "Hydration Advisory", "description": "Ensure ample hydration during peak sun hours.", "priority": "Medium", "trigger_indicator": "Heat Score (40.0)"}]'::jsonb,
    '{"heat_factor": "Maximum temperature near 33C", "rainfall_factor": "Moderate recent rainfall", "dry_spell_factor": "Precipitation within normal range"}'::jsonb,
    'v1.0-mvp',
    'Demo Baseline Seed'
) ON CONFLICT DO NOTHING;
