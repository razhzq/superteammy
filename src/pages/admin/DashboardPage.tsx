import { useEffect, useState } from "react";
import { Users, GraduationCap, MapPin, Calendar } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useEvents } from "../../hooks/useCms";

interface Student {
  id: string;
  year_level: string;
  campus_location: string | null;
  status: string;
}

const YEAR_LABEL: Record<string, string> = {
  year_1: "Year 1",
  year_2: "Year 2",
  year_3: "Year 3",
  year_4: "Year 4",
  year_5: "Year 5",
  postgrad: "Postgrad",
};

const YEAR_ORDER = ["year_1", "year_2", "year_3", "year_4", "year_5", "postgrad"];

function StatCard({ label, count, icon: Icon, color }: { label: string; count: number; icon: React.ElementType; color: string }) {
  return (
    <div className="flex items-center gap-[16px] p-[24px] rounded-[14px] bg-[var(--surface)] border border-[var(--border)]">
      <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[10px]" style={{ background: `${color}14` }}>
        <Icon size={20} color={color} />
      </div>
      <div className="flex flex-col gap-[2px]">
        <span className="font-outfit text-[28px] font-bold text-[var(--text-primary)] tracking-[-1px]">{count}</span>
        <span className="font-inter text-[12px] text-[var(--text-secondary)]">{label}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const { data: events } = useEvents();

  useEffect(() => {
    async function fetchStudents() {
      setStudentsLoading(true);
      const { data } = await supabase.from("students").select("id, year_level, campus_location, status");
      setStudents((data as Student[]) ?? []);
      setStudentsLoading(false);
    }
    fetchStudents();
  }, []);

  const activeStudents = students.filter((s) => s.status === "active");

  const byYear = YEAR_ORDER.map((key) => ({
    label: YEAR_LABEL[key],
    count: activeStudents.filter((s) => s.year_level === key).length,
  })).filter((r) => r.count > 0);

  const byCampus = Object.entries(
    activeStudents.reduce<Record<string, number>>((acc, s) => {
      const campus = s.campus_location ?? "Unknown";
      acc[campus] = (acc[campus] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const upcoming = events
    .filter((e) => e.status === "published" && new Date(e.event_date) >= new Date())
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-[32px] p-[40px] max-w-[1000px]">
      <div className="flex flex-col gap-[4px]">
        <h1 className="font-outfit text-[28px] font-bold text-[var(--text-primary)] tracking-[-1px]">Dashboard</h1>
        <p className="font-inter text-[14px] text-[var(--text-secondary)]">Overview of enrolled students and upcoming events.</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-[16px]">
        <StatCard label="Total Students" count={activeStudents.length} icon={Users} color="#5522e0" />
        <StatCard label="Year Levels" count={byYear.length} icon={GraduationCap} color="#f4a60b" />
        <StatCard label="Campuses" count={byCampus.length} icon={MapPin} color="#5522e0" />
      </div>

      {studentsLoading ? (
        <div className="flex items-center justify-center py-[40px]">
          <div className="w-[24px] h-[24px] border-2 border-[var(--primary-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          {/* By Year Level */}
          <div className="flex flex-col gap-[12px]">
            <h2 className="font-outfit text-[16px] font-semibold text-[var(--text-primary)]">Students by Year</h2>
            {byYear.length === 0 ? (
              <p className="font-inter text-[13px] text-[var(--text-muted)]">No data yet.</p>
            ) : (
              <div className="flex flex-col gap-[8px]">
                {byYear.map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-[16px] py-[12px] rounded-[10px] bg-[var(--surface)] border border-[var(--border)]">
                    <span className="font-inter text-[13px] text-[var(--text-primary)]">{row.label}</span>
                    <span className="font-inter text-[13px] font-semibold text-[var(--primary-accent)]">{row.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* By Campus */}
          <div className="flex flex-col gap-[12px]">
            <h2 className="font-outfit text-[16px] font-semibold text-[var(--text-primary)]">Students by Campus</h2>
            {byCampus.length === 0 ? (
              <p className="font-inter text-[13px] text-[var(--text-muted)]">No data yet.</p>
            ) : (
              <div className="flex flex-col gap-[8px]">
                {byCampus.map(([campus, count]) => (
                  <div key={campus} className="flex items-center justify-between px-[16px] py-[12px] rounded-[10px] bg-[var(--surface)] border border-[var(--border)]">
                    <span className="font-inter text-[13px] text-[var(--text-primary)]">{campus}</span>
                    <span className="font-inter text-[13px] font-semibold text-[var(--primary-accent)]">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="flex flex-col gap-[12px]">
        <h2 className="font-outfit text-[16px] font-semibold text-[var(--text-primary)]">
          <span className="inline-flex items-center gap-[8px]"><Calendar size={16} />Upcoming Events</span>
        </h2>
        {upcoming.length === 0 ? (
          <p className="font-inter text-[13px] text-[var(--text-muted)]">No upcoming events.</p>
        ) : (
          <div className="flex flex-col gap-[8px]">
            {upcoming.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-[16px] rounded-[10px] bg-[var(--surface)] border border-[var(--border)]">
                <div className="flex flex-col gap-[2px]">
                  <span className="font-inter text-[14px] font-medium text-[var(--text-primary)]">{e.title}</span>
                  <span className="font-inter text-[12px] text-[var(--text-secondary)]">{e.location}</span>
                </div>
                <span className="font-inter text-[12px] text-[var(--text-muted)]">
                  {new Date(e.event_date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
