import { useState, useEffect } from "react";
import { Mail, Filter, Send, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email: string | null;
  year_level: string;
  specialty: string | null;
  campus_location: string | null;
  status: string;
}

interface EmailFilters {
  yearLevel: string;
  specialty: string;
  campus: string;
  status: string;
}

export default function EmailBlastPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const [filters, setFilters] = useState<EmailFilters>({
    yearLevel: "all",
    specialty: "all",
    campus: "all",
    status: "active",
  });

  const [emailData, setEmailData] = useState({
    subject: "",
    message: "",
  });

  // Fetch all students
  useEffect(() => {
    fetchStudents();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [students, filters]);

  async function fetchStudents() {
    setLoading(true);
    const { data } = await supabase.from("students").select("*").order("full_name");
    setStudents((data as Student[]) || []);
    setLoading(false);
  }

  function applyFilters() {
    let filtered = students;

    if (filters.status !== "all") {
      filtered = filtered.filter((s) => s.status === filters.status);
    }

    if (filters.yearLevel !== "all") {
      filtered = filtered.filter((s) => s.year_level === filters.yearLevel);
    }

    if (filters.specialty !== "all") {
      filtered = filtered.filter((s) => s.specialty === filters.specialty);
    }

    if (filters.campus !== "all") {
      filtered = filtered.filter((s) => s.campus_location === filters.campus);
    }

    // Only include students with valid emails
    filtered = filtered.filter((s) => s.email && s.email.includes("@"));

    setFilteredStudents(filtered);
  }

  async function handleSendEmail() {
    if (!emailData.subject || !emailData.message) {
      setResult({ success: false, message: "Please fill in subject and message" });
      return;
    }

    if (filteredStudents.length === 0) {
      setResult({ success: false, message: "No students with valid emails in selection" });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:3001/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: filteredStudents.map((s) => ({
            email: s.email,
            name: s.full_name,
          })),
          subject: emailData.subject,
          message: emailData.message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: `Email sent to ${filteredStudents.length} students` });
        setEmailData({ subject: "", message: "" });
      } else {
        setResult({ success: false, message: data.error || "Failed to send emails" });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || "Failed to send emails. Make sure API server is running." });
    } finally {
      setSending(false);
    }
  }

  const uniqueYearLevels = Array.from(new Set(students.map((s) => s.year_level))).sort();
  const uniqueSpecialties = Array.from(
    new Set(students.map((s) => s.specialty).filter(Boolean))
  ).sort();
  const uniqueCampuses = Array.from(
    new Set(students.map((s) => s.campus_location).filter(Boolean))
  ).sort();

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
    <div className="flex flex-col gap-[24px] p-[32px]">
      <div className="flex flex-col gap-[8px]">
        <h1 className="font-outfit text-[28px] font-bold text-[var(--text-primary)]">
          Email Blast
        </h1>
        <p className="font-inter text-[14px] text-[var(--text-secondary)]">
          Send emails to filtered groups of students
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-[16px] p-[24px] rounded-[12px] bg-[var(--surface-elevated)] border border-[var(--border)]">
        <div className="flex items-center gap-[8px]">
          <Filter className="w-[18px] h-[18px] text-[var(--text-secondary)]" />
          <h2 className="font-outfit text-[16px] font-semibold text-[var(--text-primary)]">
            Filter Recipients
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px]">
          {/* Status */}
          <div className="flex flex-col gap-[8px]">
            <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] outline-none focus:border-[var(--primary-accent)]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="graduated">Graduated</option>
              <option value="suspended">Suspended</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>

          {/* Year Level */}
          <div className="flex flex-col gap-[8px]">
            <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">
              Year Level
            </label>
            <select
              value={filters.yearLevel}
              onChange={(e) => setFilters({ ...filters, yearLevel: e.target.value })}
              className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] outline-none focus:border-[var(--primary-accent)]"
            >
              <option value="all">All Years</option>
              {uniqueYearLevels.map((level) => (
                <option key={level} value={level}>
                  {yearLevelLabel(level)}
                </option>
              ))}
            </select>
          </div>

          {/* Specialty */}
          <div className="flex flex-col gap-[8px]">
            <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">
              Specialty
            </label>
            <select
              value={filters.specialty}
              onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
              className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] outline-none focus:border-[var(--primary-accent)]"
            >
              <option value="all">All Specialties</option>
              {uniqueSpecialties.map((specialty) => (
                <option key={specialty} value={specialty ?? ""}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Campus */}
          <div className="flex flex-col gap-[8px]">
            <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">
              Campus
            </label>
            <select
              value={filters.campus}
              onChange={(e) => setFilters({ ...filters, campus: e.target.value })}
              className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] outline-none focus:border-[var(--primary-accent)]"
            >
              <option value="all">All Campuses</option>
              {uniqueCampuses.map((campus) => (
                <option key={campus} value={campus ?? ""}>
                  {campus}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recipient Count */}
        <div className="flex items-center gap-[8px] pt-[8px]">
          <Mail className="w-[16px] h-[16px] text-[var(--primary-accent)]" />
          <span className="font-inter text-[14px] text-[var(--text-primary)]">
            <span className="font-semibold">{filteredStudents.length}</span> students will receive
            this email
          </span>
        </div>
      </div>

      {/* Filtered Students Preview Table */}
      {filteredStudents.length > 0 && (
        <div className="flex flex-col gap-[16px] p-[24px] rounded-[12px] bg-[var(--surface-elevated)] border border-[var(--border)]">
          <h2 className="font-outfit text-[16px] font-semibold text-[var(--text-primary)]">
            Recipients Preview ({filteredStudents.length} students)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-[12px] py-[10px] font-inter text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Student ID
                  </th>
                  <th className="text-left px-[12px] py-[10px] font-inter text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Name
                  </th>
                  <th className="text-left px-[12px] py-[10px] font-inter text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Email
                  </th>
                  <th className="text-left px-[12px] py-[10px] font-inter text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Year
                  </th>
                  <th className="text-left px-[12px] py-[10px] font-inter text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Specialty
                  </th>
                  <th className="text-left px-[12px] py-[10px] font-inter text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Campus
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.slice(0, 10).map((student) => (
                  <tr key={student.id} className="border-b border-[var(--border)] hover:bg-[var(--surface)] transition-colors">
                    <td className="px-[12px] py-[12px] font-mono text-[13px] text-[var(--text-primary)]">
                      {student.student_id}
                    </td>
                    <td className="px-[12px] py-[12px] font-inter text-[13px] text-[var(--text-primary)]">
                      {student.full_name}
                    </td>
                    <td className="px-[12px] py-[12px] font-inter text-[13px] text-[var(--text-secondary)]">
                      {student.email}
                    </td>
                    <td className="px-[12px] py-[12px] font-inter text-[13px] text-[var(--text-secondary)]">
                      {yearLevelLabel(student.year_level)}
                    </td>
                    <td className="px-[12px] py-[12px] font-inter text-[13px] text-[var(--text-secondary)]">
                      {student.specialty || "—"}
                    </td>
                    <td className="px-[12px] py-[12px] font-inter text-[13px] text-[var(--text-secondary)]">
                      {student.campus_location || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length > 10 && (
            <p className="font-inter text-[12px] text-[var(--text-secondary)] text-center">
              Showing first 10 of {filteredStudents.length} students
            </p>
          )}
        </div>
      )}

      {/* Email Composer */}
      <div className="flex flex-col gap-[16px] p-[24px] rounded-[12px] bg-[var(--surface-elevated)] border border-[var(--border)]">
        <h2 className="font-outfit text-[16px] font-semibold text-[var(--text-primary)]">
          Compose Email
        </h2>

        {/* Subject */}
        <div className="flex flex-col gap-[8px]">
          <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">
            Subject
          </label>
          <input
            type="text"
            value={emailData.subject}
            onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
            placeholder="Enter email subject"
            className="px-[16px] py-[12px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] outline-none focus:border-[var(--primary-accent)]"
          />
        </div>

        {/* Message */}
        <div className="flex flex-col gap-[8px]">
          <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">
            Message
          </label>
          <textarea
            value={emailData.message}
            onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
            placeholder="Enter your message here..."
            rows={10}
            className="px-[16px] py-[12px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] outline-none focus:border-[var(--primary-accent)] resize-none"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendEmail}
          disabled={sending || filteredStudents.length === 0}
          className="flex items-center justify-center gap-[8px] px-[24px] py-[14px] rounded-[8px] bg-[var(--primary)] text-white font-inter text-[14px] font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          <Send className="w-[18px] h-[18px]" />
          {sending ? "Sending..." : `Send to ${filteredStudents.length} Students`}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`flex items-center gap-[12px] p-[16px] rounded-[8px] border ${
            result.success
              ? "bg-green-950/20 border-green-500/30"
              : "bg-red-950/20 border-red-500/30"
          }`}
        >
          {result.success ? (
            <CheckCircle className="w-[20px] h-[20px] text-green-500" />
          ) : (
            <XCircle className="w-[20px] h-[20px] text-red-500" />
          )}
          <span
            className={`font-inter text-[14px] ${
              result.success ? "text-green-400" : "text-red-400"
            }`}
          >
            {result.message}
          </span>
        </div>
      )}
    </div>
  );
}
