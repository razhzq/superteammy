import { useState } from "react";
import { supabase } from "../lib/supabase";
import { CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    year_level: "year_1",
    specialty: "",
    campus_location: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Generate student ID
      const { data: lastStudent } = await supabase
        .from("students")
        .select("student_id")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      let nextId = "DS2024001";
      if (lastStudent?.student_id) {
        const lastNum = parseInt(lastStudent.student_id.replace("DS", ""));
        nextId = `DS${(lastNum + 1).toString().padStart(7, "0")}`;
      }

      const studentData = {
        student_id: nextId,
        full_name: formData.full_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        year_level: formData.year_level,
        specialty: formData.specialty || null,
        enrollment_date: new Date().toISOString().split("T")[0],
        status: "active",
        campus_location: formData.campus_location || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
      };

      const { error: insertError } = await supabase.from("students").insert([studentData]);

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        gender: "",
        year_level: "year_1",
        specialty: "",
        campus_location: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center p-[16px]">
        <div className="max-w-[500px] w-full bg-[var(--surface-elevated)] rounded-[16px] p-[32px] text-center">
          <CheckCircle className="w-[64px] h-[64px] text-green-500 mx-auto mb-[16px]" />
          <h1 className="font-outfit text-[24px] font-bold text-[var(--text-primary)] mb-[8px]">
            Registration Successful!
          </h1>
          <p className="font-inter text-[14px] text-[var(--text-secondary)] mb-[24px]">
            Your student registration has been submitted successfully.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="px-[24px] py-[12px] rounded-[8px] bg-[var(--primary)] text-white font-inter text-[14px] font-medium hover:opacity-90"
          >
            Register Another Student
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] py-[32px] px-[16px]">
      <div className="max-w-[600px] mx-auto">
        <div className="bg-[var(--surface-elevated)] rounded-[16px] p-[24px] md:p-[32px]">
          <h1 className="font-outfit text-[24px] md:text-[28px] font-bold text-[var(--text-primary)] mb-[8px]">
            Student Registration
          </h1>
          <p className="font-inter text-[14px] text-[var(--text-secondary)] mb-[24px]">
            Fill in your details to register as a student
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
            {/* Full Name */}
            <div className="flex flex-col gap-[6px]">
              <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                Full Name *
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px]"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-[6px]">
              <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px]"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-[6px]">
              <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+60123456789"
                className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px]"
              />
            </div>

            {/* Date of Birth & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <div className="flex flex-col gap-[6px]">
                <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                  className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-[6px]">
                <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px]"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Year Level & Specialty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <div className="flex flex-col gap-[6px]">
                <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                  Year Level *
                </label>
                <select
                  name="year_level"
                  value={formData.year_level}
                  onChange={handleChange}
                  required
                  className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px]"
                >
                  <option value="year_1">Year 1</option>
                  <option value="year_2">Year 2</option>
                  <option value="year_3">Year 3</option>
                  <option value="year_4">Year 4</option>
                  <option value="year_5">Year 5</option>
                  <option value="postgrad">Postgrad</option>
                </select>
              </div>

              <div className="flex flex-col gap-[6px]">
                <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                  Specialty
                </label>
                <input
                  type="text"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  placeholder="e.g., Orthodontics"
                  className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px]"
                />
              </div>
            </div>

            {/* Campus Location */}
            <div className="flex flex-col gap-[6px]">
              <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                Campus Location
              </label>
              <input
                type="text"
                name="campus_location"
                value={formData.campus_location}
                onChange={handleChange}
                placeholder="e.g., Main Campus"
                className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px]"
              />
            </div>

            {/* Emergency Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <div className="flex flex-col gap-[6px]">
                <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-[6px]">
                <label className="font-inter text-[12px] font-medium text-[var(--text-secondary)] uppercase">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  placeholder="+60123456789"
                  className="px-[12px] py-[10px] rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-inter text-[14px]"
                />
              </div>
            </div>

            {error && (
              <div className="p-[12px] rounded-[8px] bg-red-950/20 border border-red-500/30 text-red-400 font-inter text-[14px]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-[24px] py-[14px] rounded-[8px] bg-[var(--primary)] text-white font-inter text-[14px] font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
