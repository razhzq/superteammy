-- ============================================================
-- Migration Step 1: Clean up old schema and update types
-- Run this FIRST, then run migration-step2.sql
-- ============================================================

-- Drop old tables
DROP TABLE IF EXISTS landing_content CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- Drop old types
DROP TYPE IF EXISTS content_status CASCADE;

-- Add 'viewer' to user_role enum if it doesn't exist
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'viewer';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create new types
DO $$ BEGIN
  CREATE TYPE student_status AS ENUM ('active', 'graduated', 'suspended', 'withdrawn');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE year_level AS ENUM ('year_1', 'year_2', 'year_3', 'year_4', 'year_5', 'postgrad');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
