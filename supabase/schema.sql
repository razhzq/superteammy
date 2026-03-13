-- ============================================================
-- Superteam Malaysia CMS — Supabase Schema
-- Auth: Privy (external) | Data: Supabase
-- Run this in Supabase SQL Editor to set up your database.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── Custom Types ──
create type user_role as enum ('admin', 'editor');
create type content_status as enum ('draft', 'published');

-- ── Profiles (keyed by Privy user ID) ──
create table profiles (
  id text primary key,
  email text not null default '',
  role user_role not null default 'editor',
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ── Events ──
create table events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  event_date timestamptz not null,
  location text not null,
  image_url text,
  registration_link text,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Members ──
create table members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text not null,
  company text not null,
  bio text,
  avatar_url text,
  skills text[] not null default '{}',
  twitter_url text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Partners ──
create table partners (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  logo_url text not null,
  website_url text,
  created_at timestamptz not null default now()
);

-- ── Projects ──
create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null,
  logo_url text,
  project_url text,
  created_at timestamptz not null default now()
);

-- ── Announcements ──
create table announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  cover_image_url text,
  status content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Landing Content ──
create table landing_content (
  id uuid primary key default uuid_generate_v4(),
  section text not null unique,
  content_json jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ── Auto-update updated_at ──
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_events_updated_at
  before update on events for each row execute function update_updated_at();

create trigger set_announcements_updated_at
  before update on announcements for each row execute function update_updated_at();

create trigger set_landing_content_updated_at
  before update on landing_content for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
-- NOTE: Auth is handled by Privy (external), not Supabase Auth.
-- Access control is enforced at the application level via
-- ProtectedRoute and role checks. RLS is disabled so the
-- Supabase anon key can perform CRUD from the admin dashboard.
--
-- For production hardening, consider:
-- 1. Forwarding Privy JWTs to Supabase as custom JWTs
-- 2. Using a Supabase Edge Function proxy with Privy verification
-- ============================================================

-- Public read access for landing page content
alter table events enable row level security;
alter table members enable row level security;
alter table partners enable row level security;
alter table projects enable row level security;
alter table announcements enable row level security;
alter table landing_content enable row level security;
alter table profiles enable row level security;

-- Allow all operations via anon key (app-level auth via Privy)
create policy "Allow all" on profiles for all using (true) with check (true);
create policy "Allow all" on events for all using (true) with check (true);
create policy "Allow all" on members for all using (true) with check (true);
create policy "Allow all" on partners for all using (true) with check (true);
create policy "Allow all" on projects for all using (true) with check (true);
create policy "Allow all" on announcements for all using (true) with check (true);
create policy "Allow all" on landing_content for all using (true) with check (true);

-- ============================================================
-- Storage bucket for media uploads
-- ============================================================
-- In Supabase Dashboard > Storage:
-- 1. Create a bucket named "media" (public)
-- 2. Add policy: allow all operations (since auth is external)

-- ============================================================
-- First admin setup
-- After your first Privy login, promote yourself:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
-- ============================================================
