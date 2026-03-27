import { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown } from "lucide-react";
import Navigation from "../components/Navigation";
import { supabase } from "../lib/supabase";

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  year_level: string;
  specialty: string | null;
  status: string;
  campus_location: string | null;
}

const YEAR_LEVELS = [
  { value: "", label: "All Years" },
  { value: "year_1", label: "Year 1" },
  { value: "year_2", label: "Year 2" },
  { value: "year_3", label: "Year 3" },
  { value: "year_4", label: "Year 4" },
  { value: "year_5", label: "Year 5" },
  { value: "postgrad", label: "Postgrad" },
];

export default function StudentsDirectory() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [campusFilter, setCampusFilter] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("status", "active")
      .order("full_name");
    setStudents((data as Student[]) || []);
    setLoading(false);
  }

  const specialties = useMemo(() => {
    const vals = Array.from(new Set(students.map((s) => s.specialty).filter(Boolean))) as string[];
    return vals.sort();
  }, [students]);

  const campuses = useMemo(() => {
    const vals = Array.from(new Set(students.map((s) => s.campus_location).filter(Boolean))) as string[];
    return vals.sort();
  }, [students]);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = !yearFilter || s.year_level === yearFilter;
    const matchesSpecialty = !specialtyFilter || s.specialty === specialtyFilter;
    const matchesCampus = !campusFilter || s.campus_location === campusFilter;
    return matchesSearch && matchesYear && matchesSpecialty && matchesCampus;
  });

  const yearLevelLabel = (level: string) => {
    const map: Record<string, string> = {
      year_1: "Year 1",
      year_2: "Year 2",
      year_3: "Year 3",
      year_4: "Year 4",
      year_5: "Year 5",
      postgrad: "Postgrad",
    };
    return map[level] || level;
  };

  return (
    <div className="relative flex flex-col w-full min-h-screen bg-[var(--background)]">
      <Navigation />

      {/* Header */}
      <div className="relative flex flex-col items-center gap-[12px] md:gap-[16px] w-full pt-[48px] md:pt-[80px] px-[20px] md:px-[40px]">
        <h1 className="font-outfit text-[28px] md:text-[40px] font-bold text-[var(--text-primary)] tracking-[-1px] md:tracking-[-1.2px] text-center">
          Dentistry Students Directory
        </h1>
        <p className="font-inter text-[16px] text-[var(--text-secondary)] text-center max-w-[600px]">
          Browse all enrolled dentistry students across campuses
        </p>
      </div>

      {/* Search */}
      <div className="relative flex items-center gap-[12px] w-full max-w-[720px] mx-auto h-[48px] md:h-[56px] rounded-[12px] md:rounded-[16px] bg-[var(--surface-elevated)] border border-[var(--border)] px-[16px] md:px-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.25)] mt-[28px] md:mt-[40px]">
        <Search className="w-[20px] h-[20px] text-[var(--text-muted)] shrink-0" />
        <input
          type="text"
          placeholder="Search by name, ID, or specialty"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent font-inter text-[15px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-[10px] w-full max-w-[720px] mx-auto pt-[12px] px-[20px] md:px-0">
        {/* Year filter */}
        <div className="relative">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="appearance-none h-[38px] pl-[14px] pr-[32px] rounded-[10px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] outline-none cursor-pointer hover:border-[var(--border-light)] transition-colors"
          >
            {YEAR_LEVELS.map((y) => (
              <option key={y.value} value={y.value}>{y.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[var(--text-muted)]" />
        </div>

        {/* Specialty filter */}
        {specialties.length > 0 && (
          <div className="relative">
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="appearance-none h-[38px] pl-[14px] pr-[32px] rounded-[10px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] outline-none cursor-pointer hover:border-[var(--border-light)] transition-colors"
            >
              <option value="">All Specialties</option>
              {specialties.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[var(--text-muted)]" />
          </div>
        )}

        {/* Campus filter */}
        {campuses.length > 0 && (
          <div className="relative">
            <select
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
              className="appearance-none h-[38px] pl-[14px] pr-[32px] rounded-[10px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] outline-none cursor-pointer hover:border-[var(--border-light)] transition-colors"
            >
              <option value="">All Campuses</option>
              {campuses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[var(--text-muted)]" />
          </div>
        )}

        {/* Clear filters */}
        {(yearFilter || specialtyFilter || campusFilter) && (
          <button
            onClick={() => { setYearFilter(""); setSpecialtyFilter(""); setCampusFilter(""); }}
            className="h-[38px] px-[14px] rounded-[10px] font-inter text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-light)] transition-colors cursor-pointer bg-transparent"
          >
            Clear
          </button>
        )}
      </div>

      {/* Student List */}
      <div className="relative flex flex-col gap-[12px] w-full px-[20px] md:px-[80px] py-[40px] md:py-[60px]">
        {loading ? (
          <div className="flex items-center justify-center py-[60px]">
            <div className="w-[24px] h-[24px] border-2 border-[var(--primary-accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[60px] gap-[12px]">
            <span className="font-inter text-[14px] text-[var(--text-secondary)]">
              No students found
            </span>
          </div>
        ) : (
          <>
            {/* List Header */}
            <div className="hidden md:flex items-center gap-[24px] w-full px-[28px] opacity-50">
              <div className="w-[120px]">
                <span className="font-inter text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.8px] uppercase">
                  Student ID
                </span>
              </div>
              <div className="flex-1">
                <span className="font-inter text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.8px] uppercase">
                  Name
                </span>
              </div>
              <div className="w-[120px]">
                <span className="font-inter text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.8px] uppercase">
                  Year
                </span>
              </div>
              <div className="w-[180px]">
                <span className="font-inter text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.8px] uppercase">
                  Specialty
                </span>
              </div>
              <div className="w-[140px]">
                <span className="font-inter text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.8px] uppercase">
                  Campus
                </span>
              </div>
            </div>

            {/* Student Cards */}
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex flex-col md:flex-row md:items-center gap-[8px] md:gap-[24px] w-full rounded-[14px] bg-[var(--surface)] border border-[var(--border)] px-[20px] md:px-[28px] py-[16px] md:py-[20px] hover:border-[var(--border-light)] transition-colors"
              >
                <div className="w-full md:w-[120px]">
                  <span className="font-mono text-[13px] font-medium text-[var(--text-primary)]">
                    {student.student_id}
                  </span>
                </div>
                <div className="flex-1">
                  <span className="font-inter text-[15px] font-semibold text-[var(--text-primary)]">
                    {student.full_name}
                  </span>
                  {student.email && (
                    <span className="block font-inter text-[12px] text-[var(--text-secondary)] mt-[2px]">
                      {student.email}
                    </span>
                  )}
                </div>
                <div className="w-full md:w-[120px]">
                  <span className="font-inter text-[13px] text-[var(--text-secondary)]">
                    {yearLevelLabel(student.year_level)}
                  </span>
                </div>
                <div className="w-full md:w-[180px]">
                  <span className="font-inter text-[13px] text-[var(--text-secondary)]">
                    {student.specialty || "—"}
                  </span>
                </div>
                <div className="w-full md:w-[140px]">
                  <span className="font-inter text-[13px] text-[var(--text-secondary)]">
                    {student.campus_location || "—"}
                  </span>
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className="flex items-center justify-center w-full pt-[16px]">
              <span className="font-inter text-[13px] text-[var(--text-muted)]">
                Showing {filteredStudents.length} of {students.length} students
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
