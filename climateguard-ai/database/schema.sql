-- ClimateGuard AI — Supabase PostgreSQL Schema
-- Community Climate Risk Intelligence Platform

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table 1: Locations
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    elevation DOUBLE PRECISION,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_location_name_state UNIQUE (name, state)
);

CREATE INDEX IF NOT EXISTS idx_locations_name ON locations (name);
CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON locations (latitude, longitude);

-- Table 2: Climate Records (Historical and Observed)
CREATE TABLE IF NOT EXISTS climate_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL,
    temperature DOUBLE PRECISION,
    precipitation DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    source TEXT NOT NULL,
    record_type TEXT NOT NULL CHECK (record_type IN ('observed', 'historical', 'forecast', 'demo')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_climate_records_location_time ON climate_records (location_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_climate_records_type ON climate_records (record_type);

-- Table 3: Risk Assessments
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    heat_score DOUBLE PRECISION,
    rainfall_score DOUBLE PRECISION,
    dry_spell_score DOUBLE PRECISION,
    overall_score DOUBLE PRECISION,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('Low', 'Moderate', 'High', 'Unavailable')),
    recommendations JSONB DEFAULT '[]'::jsonb,
    contributing_factors JSONB DEFAULT '{}'::jsonb,
    methodology_version TEXT NOT NULL DEFAULT 'v1.0-mvp',
    data_source TEXT NOT NULL,
    data_period_start DATE,
    data_period_end DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_location_time ON risk_assessments (location_id, assessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_level ON risk_assessments (risk_level);
