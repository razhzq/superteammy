import { useState, useEffect } from "react";
import { Search, Upload, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Navigation from "../components/Navigation";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

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

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function StudentsDirectory() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { authenticated, role } = useAuth();

  const isAdmin = authenticated && (role === "admin" || role === "editor");

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

  const filteredStudents = students.filter((s) =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || null;
      });
      rows.push(row);
    }

    return rows;
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    const errors: string[] = [];
    let successCount = 0;
    let failedCount = 0;

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      for (const row of rows) {
        try {
          const studentData = {
            student_id: row.student_id,
            full_name: row.full_name,
            email: row.email || null,
            phone: row.phone || null,
            date_of_birth: row.date_of_birth || null,
            gender: row.gender || null,
            year_level: row.year_level,
            specialty: row.specialty || null,
            enrollment_date: row.enrollment_date,
            expected_graduation_date: row.expected_graduation_date || null,
            status: row.status || "active",
            campus_location: row.campus_location || null,
            emergency_contact_name: row.emergency_contact_name || null,
            emergency_contact_phone: row.emergency_contact_phone || null,
            notes: row.notes || null,
          };

          const { error } = await supabase.from("students").insert(studentData);

          if (error) {
            failedCount++;
            errors.push(`${row.student_id}: ${error.message}`);
          } else {
            successCount++;
          }
        } catch (err: any) {
          failedCount++;
          errors.push(`${row.student_id}: ${err.message}`);
        }
      }

      await supabase.from("import_history").insert({
        filename: file.name,
        records_imported: successCount,
        records_failed: failedCount,
        import_notes: errors.length > 0 ? errors.join("; ") : "Success",
      });

      setResult({ success: successCount, failed: failedCount, errors });
      fetchStudents(); // Refresh list
    } catch (err: any) {
      errors.push(`File parsing error: ${err.message}`);
      setResult({ success: 0, failed: 0, errors });
    } finally {
      setImporting(false);
    }
  };

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

      {/* Search & Upload */}
      <div className="relative flex flex-col md:flex-row items-center justify-center gap-[12px] w-full pt-[28px] md:pt-[40px] px-[20px] md:px-[40px]">
        <div className="flex items-center gap-[12px] w-full max-w-[720px] h-[48px] md:h-[56px] rounded-[12px] md:rounded-[16px] bg-[var(--surface-elevated)] border border-[var(--border)] px-[16px] md:px-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
          <Search className="w-[20px] h-[20px] text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by name, ID, or specialty"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent font-inter text-[15px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
          />
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-[8px] px-[20px] h-[48px] md:h-[56px] rounded-[12px] bg-[var(--primary)] text-white font-inter text-[14px] font-medium hover:opacity-90 transition-opacity"
          >
            <Upload className="w-[18px] h-[18px]" />
            Import CSV
          </button>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && isAdmin && (
        <div className="relative flex flex-col gap-[16px] w-full max-w-[720px] mx-auto mt-[20px] p-[24px] rounded-[12px] bg-[var(--surface-elevated)] border border-[var(--border)] mx-[20px] md:mx-auto">
          <h3 className="font-outfit text-[18px] font-semibold text-[var(--text-primary)]">
            Upload Student CSV
          </h3>

          <label
            htmlFor="csv-upload"
            className="flex flex-col items-center justify-center gap-[12px] p-[32px] border-2 border-dashed border-[var(--border)] rounded-[12px] cursor-pointer hover:border-[var(--primary-accent)] transition-colors"
          >
            <Upload className="w-[32px] h-[32px] text-[var(--text-secondary)]" />
            <div className="flex flex-col items-center gap-[4px]">
              <span className="font-inter text-[14px] font-medium text-[var(--text-primary)]">
                {file ? file.name : "Click to upload CSV file"}
              </span>
              <span className="font-inter text-[12px] text-[var(--text-secondary)]">
                CSV format with student data
              </span>
            </div>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {file && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-[20px] py-[12px] rounded-[8px] bg-[var(--primary)] text-white font-inter text-[14px] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {importing ? "Importing..." : "Import Students"}
            </button>
          )}

          {result && (
            <div className="flex flex-col gap-[12px] p-[16px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)]">
              <div className="flex gap-[16px]">
                <div className="flex items-center gap-[8px]">
                  <CheckCircle className="w-[18px] h-[18px] text-green-500" />
                  <span className="font-inter text-[13px] text-[var(--text-primary)]">
                    {result.success} imported
                  </span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <XCircle className="w-[18px] h-[18px] text-red-500" />
                  <span className="font-inter text-[13px] text-[var(--text-primary)]">
                    {result.failed} failed
                  </span>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="flex flex-col gap-[4px] max-h-[150px] overflow-y-auto">
                  {result.errors.slice(0, 5).map((error, i) => (
                    <span
                      key={i}
                      className="font-mono text-[10px] text-red-400 bg-red-950/20 px-[8px] py-[4px] rounded"
                    >
                      {error}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
