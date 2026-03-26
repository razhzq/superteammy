-- ============================================================
-- Migration Step 2: Create new tables
-- Run this AFTER migration-step1.sql
-- ============================================================

-- Update profiles table default
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'viewer';

-- ── Students ──
CREATE TABLE IF NOT EXISTS students (
  id uuid primary key default uuid_generate_v4(),
  student_id text unique not null,
  full_name text not null,
  email text,
  phone text,
  date_of_birth date,
  gender text,
  
  -- Academic Info
  year_level year_level not null,
  specialty text,
  enrollment_date date not null,
  expected_graduation_date date,
  status student_status not null default 'active',
  
  -- Location/Campus
  campus_location text,
  
  -- Additional Info
  emergency_contact_name text,
  emergency_contact_phone text,
  notes text,
  
  -- Metadata
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Courses ──
CREATE TABLE IF NOT EXISTS courses (
  id uuid primary key default uuid_generate_v4(),
  course_code text unique not null,
  course_name text not null,
  description text,
  credits integer,
  year_level year_level,
  specialty text,
  created_at timestamptz not null default now()
);

-- ── Student Course Enrollments ──
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references students(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  semester text,
  grade text,
  status text default 'enrolled',
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(student_id, course_id, semester)
);

-- ── Import History ──
CREATE TABLE IF NOT EXISTS import_history (
  id uuid primary key default uuid_generate_v4(),
  filename text not null,
  records_imported integer not null default 0,
  records_failed integer not null default 0,
  imported_by text,
  import_notes text,
  created_at timestamptz not null default now()
);

-- ── Triggers ──
DROP TRIGGER IF EXISTS set_students_updated_at ON students;
CREATE TRIGGER set_students_updated_at
  BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_year_level ON students(year_level);
CREATE INDEX IF NOT EXISTS idx_students_specialty ON students(specialty);
CREATE INDEX IF NOT EXISTS idx_students_campus ON students(campus_location);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);

-- ── RLS Policies ──
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all" ON students;
DROP POLICY IF EXISTS "Allow all" ON courses;
DROP POLICY IF EXISTS "Allow all" ON enrollments;
DROP POLICY IF EXISTS "Allow all" ON import_history;

CREATE POLICY "Allow all" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON enrollments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON import_history FOR ALL USING (true) WITH CHECK (true);
