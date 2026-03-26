import { useState, useEffect } from "react";
import { Plus, Upload, CheckCircle, XCircle, AlertCircle, X, Search } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  year_level: string;
  specialty: string | null;
  enrollment_date: string;
  expected_graduation_date: string | null;
  status: string;
  campus_location: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
  created_at: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

type FormData = Omit<Student, "id" | "created_at" | "updated_at">;

const EMPTY_FORM: FormData = {
  student_id: "",
  full_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  gender: "",
  year_level: "year_1",
  specialty: "",
  enrollment_date: new Date().toISOString().split("T")[0],
  expected_graduation_date: "",
  status: "active",
  campus_location: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  notes: "",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Add Student Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Import CSV Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    const { data } = await supabase.from("students").select("*").order("created_at", { ascending: false });
    setStudents((data as Student[]) || []);
    setLoading(false);
  }

  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleAddStudent() {
    setSaving(true);
    
    // Clean up the data - convert empty strings to null
    const cleanData = {
      student_id: formData.student_id,
      full_name: formData.full_name,
      email: formData.email || null,
      phone: formData.phone || null,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || null,
      year_level: formData.year_level,
      specialty: formData.specialty || null,
      enrollment_date: formData.enrollment_date,
      expected_graduation_date: formData.expected_graduation_date || null,
      status: formData.status || "active",
      campus_location: formData.campus_location || null,
      emergency_contact_name: formData.emergency_contact_name || null,
      emergency_contact_phone: formData.emergency_contact_phone || null,
      notes: formData.notes || null,
    };
    
    const { error } = await supabase.from("students").insert(cleanData);
    
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setShowAddModal(false);
      setFormData(EMPTY_FORM);
      fetchStudents();
    }
    setSaving(false);
  }

  // CSV Import Functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImportResult(null);
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

      setImportResult({ success: successCount, failed: failedCount, errors });
      fetchStudents();
    } catch (err: any) {
      errors.push(`File parsing error: ${err.message}`);
      setImportResult({ success: 0, failed: 0, errors });
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
    <div className="flex flex-col gap-[24px] p-[32px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-[8px]">
          <h1 className="font-outfit text-[28px] font-bold text-[var(--text-primary)]">Students</h1>
          <p className="font-inter text-[14px] text-[var(--text-secondary)]">
            Manage student records and import data
          </p>
        </div>
        <div className="flex gap-[12px]">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-[8px] px-[16px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] font-medium hover:border-[var(--border-light)] transition-colors"
          >
            <Upload className="w-[16px] h-[16px]" />
            Import CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-[8px] px-[16px] py-[10px] rounded-[8px] bg-[var(--primary)] text-white font-inter text-[14px] font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-[16px] h-[16px]" />
            Add Student
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-[12px] px-[16px] py-[12px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)]">
        <Search className="w-[18px] h-[18px] text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Search by name, ID, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent font-inter text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
        />
      </div>

      {/* Students Table */}
      <div className="flex flex-col gap-[16px] p-[24px] rounded-[12px] bg-[var(--surface-elevated)] border border-[var(--border)]">
        <div className="flex items-center justify-between">
          <h2 className="font-outfit text-[18px] font-semibold text-[var(--text-primary)]">
            All Students
          </h2>
          <span className="font-inter text-[13px] text-[var(--text-secondary)]">
            {filteredStudents.length} of {students.length} students
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-[60px]">
            <div className="w-[24px] h-[24px] border-2 border-[var(--primary-accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[60px] gap-[8px]">
            <span className="font-inter text-[14px] text-[var(--text-secondary)]">
              {searchQuery ? "No students found" : "No students in database yet"}
            </span>
            {!searchQuery && (
              <span className="font-inter text-[12px] text-[var(--text-muted)]">
                Add a student or import CSV to get started
              </span>
            )}
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
                {filteredStudents.map((student) => (
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
                      {student.email || "—"}
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

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-[20px]">
          <div className="bg-[var(--surface-elevated)] rounded-[16px] border border-[var(--border)] w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-[24px] border-b border-[var(--border)]">
              <h2 className="font-outfit text-[20px] font-semibold text-[var(--text-primary)]">
                Add New Student
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-[8px] rounded-[8px] hover:bg-[var(--surface)] transition-colors"
              >
                <X className="w-[20px] h-[20px] text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="p-[24px] flex flex-col gap-[16px]">
              <div className="grid grid-cols-2 gap-[16px]">
                <div className="flex flex-col gap-[8px]">
                  <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] outline-none focus:border-[var(--primary-accent)]"
                  />
                </div>

                <div className="flex flex-col gap-[8px]">
                  <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] outline-none focus:border-[var(--primary-accent)]"
                  />
                </div>

                <div className="flex flex-col gap-[8px]">
                  <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] outline-none focus:border-[var(--primary-accent)]"
                  />
                </div>

                <div className="flex flex-col gap-[8px]">
                  <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] outline-none focus:border-[var(--primary-accent)]"
                  />
                </div>

                <div className="flex flex-col gap-[8px]">
                  <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth || ""}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] outline-none focus:border-[var(--primary-accent)]"
                  />
                </div>

                <div className="flex flex-col gap-[8px]">
                  <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                    Gender
                  </label>
                  <select
                    value={formData.gender || ""}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] outline-none focus:border-[var(--primary-accent)]"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-[8px]">
                  <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                    Year Level *
                  </label>
                  <select
                    value={formData.year_level}
                    onChange={(e) => setFormData({ ...formData, year_level: e.target.value })}
                    className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] outline-none focus:border-[var(--primary-accent)]"
                  >
                    <option value="year_1">Year 1</option>
                    <option value="year_2">Year 2</option>
                    <option value="year_3">Year 3</option>
                    <option value="year_4">Year 4</option>
                    <option value="year_5">Year 5</option>
                    <option value="postgrad">Postgrad</option>
                  </select>
                </div>

                <div className="flex flex-col gap-[8px]">
                  <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                    Specialty
                  </label>
                  <input
                    type="text"
                    value={formData.specialty || ""}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="e.g., Orthodontics"
                    className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] outline-none focus:border-[var(--primary-accent)]"
                  />
                </div>

                <div className="flex flex-col gap-[8px]">
                  <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                    Campus Location
                  </label>
                  <input
                    type="text"
                    value={formData.campus_location || ""}
                    onChange={(e) => setFormData({ ...formData, campus_location: e.target.value })}
                    placeholder="e.g., Main Campus"
                    className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] outline-none focus:border-[var(--primary-accent)]"
                  />
                </div>

                <div className="flex flex-col gap-[8px]">
                  <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                    Enrollment Date *
                  </label>
                  <input
                    type="date"
                    value={formData.enrollment_date}
                    onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
                    className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] outline-none focus:border-[var(--primary-accent)]"
                  />
                </div>
              </div>

              <div className="flex gap-[12px] pt-[16px]">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-[20px] py-[12px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px] font-medium hover:bg-[var(--surface-elevated)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStudent}
                  disabled={saving || !formData.student_id || !formData.full_name}
                  className="flex-1 px-[20px] py-[12px] rounded-[8px] bg-[var(--primary)] text-white font-inter text-[14px] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {saving ? "Adding..." : "Add Student"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-[20px]">
          <div className="bg-[var(--surface-elevated)] rounded-[16px] border border-[var(--border)] w-full max-w-[600px]">
            <div className="flex items-center justify-between p-[24px] border-b border-[var(--border)]">
              <h2 className="font-outfit text-[20px] font-semibold text-[var(--text-primary)]">
                Import Students from CSV
              </h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setFile(null);
                  setImportResult(null);
                }}
                className="p-[8px] rounded-[8px] hover:bg-[var(--surface)] transition-colors"
              >
                <X className="w-[20px] h-[20px] text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="p-[24px] flex flex-col gap-[16px]">
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

              {importResult && (
                <div className="flex flex-col gap-[12px] p-[16px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)]">
                  <div className="flex gap-[16px]">
                    <div className="flex items-center gap-[8px]">
                      <CheckCircle className="w-[18px] h-[18px] text-green-500" />
                      <span className="font-inter text-[13px] text-[var(--text-primary)]">
                        {importResult.success} imported
                      </span>
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <XCircle className="w-[18px] h-[18px] text-red-500" />
                      <span className="font-inter text-[13px] text-[var(--text-primary)]">
                        {importResult.failed} failed
                      </span>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="flex flex-col gap-[4px] max-h-[150px] overflow-y-auto">
                      {importResult.errors.slice(0, 5).map((error, i) => (
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
          </div>
        </div>
      )}
    </div>
  );
}
