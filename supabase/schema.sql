-- ============================================================
-- Dentistry School Student Management System — Supabase Schema
-- Auth: Privy (external) | Data: Supabase
-- Run this in Supabase SQL Editor to set up your database.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── Custom Types ──
create type user_role as enum ('admin', 'editor', 'viewer');
create type student_status as enum ('active', 'graduated', 'suspended', 'withdrawn');
create type year_level as enum ('year_1', 'year_2', 'year_3', 'year_4', 'year_5', 'postgrad');

-- ── Profiles (keyed by Privy user ID) ──
create table profiles (
  id text primary key,
  email text not null default '',
  role user_role not null default 'viewer',
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ── Students ──
create table students (
  id uuid primary key default uuid_generate_v4(),
  student_id text unique not null, -- e.g., "DS2024001"
  full_name text not null,
  email text,
  phone text,
  date_of_birth date,
  gender text,
  
  -- Academic Info
  year_level year_level not null,
  specialty text, -- e.g., "Orthodontics", "Endodontics", "General Dentistry"
  enrollment_date date not null,
  expected_graduation_date date,
  status student_status not null default 'active',
  
  -- Location/Campus
  campus_location text, -- e.g., "Main Campus", "Branch A"
  
  -- Additional Info
  emergency_contact_name text,
  emergency_contact_phone text,
  notes text,
  
  -- Metadata
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Courses ──
create table courses (
  id uuid primary key default uuid_generate_v4(),
  course_code text unique not null, -- e.g., "DENT101"
  course_name text not null,
  description text,
  credits integer,
  year_level year_level,
  specialty text,
  created_at timestamptz not null default now()
);

-- ── Student Course Enrollments ──
create table enrollments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references students(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  semester text, -- e.g., "Fall 2024", "Spring 2025"
  grade text, -- e.g., "A", "B+", "Pass"
  status text default 'enrolled', -- enrolled, completed, dropped
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(student_id, course_id, semester)
);

-- ── Import History (track CSV imports) ──
create table import_history (
  id uuid primary key default uuid_generate_v4(),
  filename text not null,
  records_imported integer not null default 0,
  records_failed integer not null default 0,
  imported_by text, -- Privy user ID
  import_notes text,
  created_at timestamptz not null default now()
);

-- ── Auto-update updated_at ──
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_students_updated_at
  before update on students for each row execute function update_updated_at();

-- ── Indexes for performance ──
create index idx_students_student_id on students(student_id);
create index idx_students_status on students(status);
create index idx_students_year_level on students(year_level);
create index idx_students_specialty on students(specialty);
create index idx_students_campus on students(campus_location);
create index idx_enrollments_student on enrollments(student_id);
create index idx_enrollments_course on enrollments(course_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table profiles enable row level security;
alter table students enable row level security;
alter table courses enable row level security;
alter table enrollments enable row level security;
alter table import_history enable row level security;

-- Allow all operations via anon key (app-level auth via Privy)
create policy "Allow all" on profiles for all using (true) with check (true);
create policy "Allow all" on students for all using (true) with check (true);
create policy "Allow all" on courses for all using (true) with check (true);
create policy "Allow all" on enrollments for all using (true) with check (true);
create policy "Allow all" on import_history for all using (true) with check (true);

-- ============================================================
-- Storage bucket for media uploads
-- ============================================================
-- In Supabase Dashboard > Storage:
-- 1. Create a bucket named "media" (public) - for student photos, documents
-- 2. Create a bucket named "imports" (private) - for CSV import files

-- ============================================================
-- First admin setup
-- After your first Privy login, promote yourself:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
-- ============================================================
