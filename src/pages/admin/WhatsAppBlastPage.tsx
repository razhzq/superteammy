import { useState, useEffect } from "react";
import { MessageCircle, Filter, Send, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  phone: string | null;
  year_level: string;
  specialty: string | null;
  campus_location: string | null;
  status: string;
}

interface WhatsAppFilters {
  yearLevel: string;
  specialty: string;
  campus: string;
  status: string;
}

interface SendResult {
  success: boolean;
  message: string;
  sent?: number;
  failed?: number;
}

export default function WhatsAppBlastPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);

  const [filters, setFilters] = useState<WhatsAppFilters>({
    yearLevel: "all",
    specialty: "all",
    campus: "all",
    status: "active",
  });

  const [messageData, setMessageData] = useState({
    template: "",
    customMessage: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

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

    // Only include students with valid phone numbers
    filtered = filtered.filter((s) => s.phone && s.phone.length >= 10);

    setFilteredStudents(filtered);
  }

  async function handleSendWhatsApp() {
    if (!messageData.customMessage && !messageData.template) {
      setResult({ success: false, message: "Please enter a message or select a template" });
      return;
    }

    if (filteredStudents.length === 0) {
      setResult({ success: false, message: "No students with valid phone numbers in selection" });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:3001/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: filteredStudents.map((s) => ({
            phone: s.phone,
            name: s.full_name,
          })),
          message: messageData.customMessage || messageData.template,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: `WhatsApp sent to ${data.sent || filteredStudents.length} students`,
          sent: data.sent,
          failed: data.failed,
        });
        setMessageData({ template: "", customMessage: "" });
      } else {
        setResult({ success: false, message: data.error || "Failed to send WhatsApp messages" });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Failed to send WhatsApp. Make sure API server is running.",
      });
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
          WhatsApp Blast
        </h1>
        <p className="font-inter text-[14px] text-[var(--text-secondary)]">
          Send WhatsApp messages to filtered groups of students
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
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>

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
                <option key={campus} value={campus}>
                  {campus}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-[8px] pt-[8px]">
          <MessageCircle className="w-[16px] h-[16px] text-green-500" />
          <span className="font-inter text-[14px] text-[var(--text-primary)]">
            <span className="font-semibold">{filteredStudents.length}</span> students will receive
            this WhatsApp message
          </span>
        </div>
      </div>

      {/* Recipients Preview */}
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
                    Phone
                  </th>
                  <th className="text-left px-[12px] py-[10px] font-inter text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Year
                  </th>
                  <th className="text-left px-[12px] py-[10px] font-inter text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Specialty
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.slice(0, 10).map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
                  >
                    <td className="px-[12px] py-[12px] font-mono text-[13px] text-[var(--text-primary)]">
                      {student.student_id}
                    </td>
                    <td className="px-[12px] py-[12px] font-inter text-[13px] text-[var(--text-primary)]">
                      {student.full_name}
                    </td>
                    <td className="px-[12px] py-[12px] font-inter text-[13px] text-[var(--text-secondary)]">
                      {student.phone}
                    </td>
                    <td className="px-[12px] py-[12px] font-inter text-[13px] text-[var(--text-secondary)]">
                      {yearLevelLabel(student.year_level)}
                    </td>
                    <td className="px-[12px] py-[12px] font-inter text-[13px] text-[var(--text-secondary)]">
                      {student.specialty || "—"}
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

      {/* Message Composer */}
      <div className="flex flex-col gap-[16px] p-[24px] rounded-[12px] bg-[var(--surface-elevated)] border border-[var(--border)]">
        <h2 className="font-outfit text-[16px] font-semibold text-[var(--text-primary)]">
          Compose WhatsApp Message
        </h2>

        <div className="flex flex-col gap-[8px]">
          <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">
            Message
          </label>
          <textarea
            value={messageData.customMessage}
            onChange={(e) => setMessageData({ ...messageData, customMessage: e.target.value })}
            placeholder="Enter your WhatsApp message here... (Use {{name}} for personalization)"
            rows={8}
            className="px-[16px] py-[12px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] outline-none focus:border-[var(--primary-accent)] resize-none"
          />
          <span className="font-inter text-[11px] text-[var(--text-muted)]">
            Tip: Use {"{"}
            {"{"}name{"}}"}
            {"}"} to personalize with student name
          </span>
        </div>

        <button
          onClick={handleSendWhatsApp}
          disabled={sending || filteredStudents.length === 0}
          className="flex items-center justify-center gap-[8px] px-[24px] py-[14px] rounded-[8px] bg-green-600 text-white font-inter text-[14px] font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          <div className="flex flex-col gap-[4px]">
            <span
              className={`font-inter text-[14px] ${
                result.success ? "text-green-400" : "text-red-400"
              }`}
            >
              {result.message}
            </span>
            {result.sent !== undefined && result.failed !== undefined && (
              <span className="font-inter text-[12px] text-[var(--text-muted)]">
                Sent: {result.sent} | Failed: {result.failed}
              </span>
            )}
          </div>
        </div>
      )}

      {/* WATI Setup Notice */}
      <div className="flex items-start gap-[12px] p-[16px] rounded-[8px] bg-blue-950/20 border border-blue-500/30">
        <AlertCircle className="w-[20px] h-[20px] text-blue-400 shrink-0 mt-[2px]" />
        <div className="flex flex-col gap-[4px]">
          <span className="font-inter text-[13px] font-medium text-blue-400">
            WATI Setup Required
          </span>
          <span className="font-inter text-[12px] text-[var(--text-secondary)]">
            To use WhatsApp Blast, you need to configure WATI API credentials in your .env file.
            Get your API key from{" "}
            <a
              href="https://app.wati.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              wati.io
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
