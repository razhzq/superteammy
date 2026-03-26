import { useState, useEffect } from "react";
import { Upload, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email: string | null;
  year_level: string;
  specialty: string | null;
  campus_location: string | null;
  status: string;
  created_at: string;
}

export default function ImportStudentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    const { data } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setStudents((data as Student[]) || []);
    setLoading(false);
  }

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

      // Log import history
      await supabase.from("import_history").insert({
        filename: file.name,
        records_imported: successCount,
        records_failed: failedCount,
        import_notes: errors.length > 0 ? errors.join("; ") : "Success",
      });

      setResult({ success: successCount, failed: failedCount, errors });
      fetchStudents(); // Refresh the student list
    } catch (err: any) {
      errors.push(`File parsing error: ${err.message}`);
      setResult({ success: 0, failed: 0, errors });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-[24px] p-[32px]">
      <div className="flex flex-col gap-[8px]">
        <h1 className="font-outfit text-[28px] font-bold text-[var(--text-primary)]">
          Import Students
        </h1>
        <p className="font-inter text-[14px] text-[var(--text-secondary)]">
          Upload a CSV file to bulk import student records
        </p>
      </div>

      {/* Upload Section */}
      <div className="flex flex-col gap-[16px] p-[24px] rounded-[12px] bg-[var(--surface-elevated)] border border-[var(--border)]">
        <label
          htmlFor="csv-upload"
          className="flex flex-col items-center justify-center gap-[12px] p-[40px] border-2 border-dashed border-[var(--border)] rounded-[12px] cursor-pointer hover:border-[var(--primary-accent)] transition-colors"
        >
          <Upload className="w-[40px] h-[40px] text-[var(--text-secondary)]" />
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
      </div>

      {/* Results */}
      {result && (
        <div className="flex flex-col gap-[16px] p-[24px] rounded-[12px] bg-[var(--surface-elevated)] border border-[var(--border)]">
          <h2 className="font-outfit text-[18px] font-semibold text-[var(--text-primary)]">
            Import Results
          </h2>

          <div className="flex gap-[16px]">
            <div className="flex items-center gap-[8px]">
              <CheckCircle className="w-[20px] h-[20px] text-green-500" />
              <span className="font-inter text-[14px] text-[var(--text-primary)]">
                {result.success} successful
              </span>
            </div>
            <div className="flex items-center gap-[8px]">
              <XCircle className="w-[20px] h-[20px] text-red-500" />
              <span className="font-inter text-[14px] text-[var(--text-primary)]">
                {result.failed} failed
              </span>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center gap-[8px]">
                <AlertCircle className="w-[16px] h-[16px] text-yellow-500" />
                <span className="font-inter text-[13px] font-medium text-[var(--text-primary)]">
                  Errors:
                </span>
              </div>
              <div className="flex flex-col gap-[4px] max-h-[200px] overflow-y-auto">
                {result.errors.map((error, i) => (
                  <span
                    key={i}
                    className="font-mono text-[11px] text-red-400 bg-red-950/20 px-[8px] py-[4px] rounded"
                  >
                    {error}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Template Download */}
      <div className="flex flex-col gap-[12px] p-[20px] rounded-[12px] bg-[var(--surface)] border border-[var(--border)]">
        <h3 className="font-inter text-[14px] font-semibold text-[var(--text-primary)]">
          CSV Format
        </h3>
        <p className="font-inter text-[12px] text-[var(--text-secondary)]">
          Your CSV should include these columns:
        </p>
        <code className="font-mono text-[11px] text-[var(--text-secondary)] bg-[var(--surface-elevated)] p-[12px] rounded overflow-x-auto">
          student_id, full_name, email, phone, date_of_birth, gender, year_level, specialty,
          enrollment_date, expected_graduation_date, status, campus_location,
          emergency_contact_name, emergency_contact_phone, notes
        </code>
      </div>

      {/* Existing Students Table */}
      <div className="flex flex-col gap-[16px] p-[24px] rounded-[12px] bg-[var(--surface-elevated)] border border-[var(--border)]">
        <div className="flex items-center justify-between">
          <h2 className="font-outfit text-[18px] font-semibold text-[var(--text-primary)]">
            Recent Students
          </h2>
          <span className="font-inter text-[13px] text-[var(--text-secondary)]">
            Showing last 50 students
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-[40px]">
            <div className="w-[24px] h-[24px] border-2 border-[var(--primary-accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[40px] gap-[8px]">
            <span className="font-inter text-[14px] text-[var(--text-secondary)]">
              No students in database yet
            </span>
            <span className="font-inter text-[12px] text-[var(--text-muted)]">
              Upload a CSV file to get started
            </span>
          </div>
        ) : (
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
                  <th className="text-left px-[12px] py-[10px] font-inter text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-[var(--border)] hover:bg-[var(--surface)] transition-colors">
                    <td className="px-[12px] py-[12px] font-mono text-[13px] text-[var(--text-primary)]">
                      {student.student_id}
                    </td>
                    <td className="px-[12px] py-[12px] font-inter text-[13px] text-[var(--text-primary)]">
                      {student.full_name}
                    </td>
                    <td className="px-[12px] py-[12px] font-inter text-[13px] text-[var(--text-secondary)]">
                      {student.email || "—"}
                    </td>
                    <td className="px-[12px] py-[12px] font-inter text-[13px] text-[var(--text-secondary)]">
                      {student.year_level.replace("year_", "Year ").replace("postgrad", "Postgrad")}
                    </td>
                    <td className="px-[12px] py-[12px] font-inter text-[13px] text-[var(--text-secondary)]">
                      {student.specialty || "—"}
                    </td>
                    <td className="px-[12px] py-[12px] font-inter text-[13px] text-[var(--text-secondary)]">
                      {student.campus_location || "—"}
                    </td>
                    <td className="px-[12px] py-[12px]">
                      <span
                        className={`inline-flex px-[8px] py-[2px] rounded-full font-inter text-[11px] font-medium ${
                          student.status === "active"
                            ? "bg-green-950/30 text-green-400"
                            : student.status === "graduated"
                            ? "bg-blue-950/30 text-blue-400"
                            : "bg-gray-950/30 text-gray-400"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
