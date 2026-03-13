import { Calendar, Users, Handshake, FolderOpen, Megaphone } from "lucide-react";
import { useEvents, useMembers, usePartners, useProjects, useAnnouncements } from "../../hooks/useCms";

function StatCard({
  label,
  count,
  icon: Icon,
  color,
}: {
  label: string;
  count: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center gap-[16px] p-[24px] rounded-[14px] bg-[var(--surface)] border border-[var(--border)]">
      <div
        className="flex items-center justify-center w-[40px] h-[40px] rounded-[10px]"
        style={{ background: `${color}14` }}
      >
        <Icon size={20} color={color} />
      </div>
      <div className="flex flex-col gap-[2px]">
        <span className="font-outfit text-[28px] font-bold text-[var(--text-primary)] tracking-[-1px]">
          {count}
        </span>
        <span className="font-inter text-[12px] text-[var(--text-secondary)]">{label}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: events } = useEvents();
  const { data: members } = useMembers();
  const { data: partners } = usePartners();
  const { data: projects } = useProjects();
  const { data: announcements } = useAnnouncements();

  const published = events.filter((e) => e.status === "published");
  const upcoming = published
    .filter((e) => new Date(e.event_date) >= new Date())
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-[32px] p-[40px] max-w-[1000px]">
      <div className="flex flex-col gap-[4px]">
        <h1 className="font-outfit text-[28px] font-bold text-[var(--text-primary)] tracking-[-1px]">
          Dashboard
        </h1>
        <p className="font-inter text-[14px] text-[var(--text-secondary)]">
          Overview of your Superteam Malaysia content.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-[16px]">
        <StatCard label="Events" count={events.length} icon={Calendar} color="#5522e0" />
        <StatCard label="Members" count={members.length} icon={Users} color="#f4a60b" />
        <StatCard label="Partners" count={partners.length} icon={Handshake} color="#5522e0" />
        <StatCard label="Projects" count={projects.length} icon={FolderOpen} color="#f4a60b" />
        <StatCard label="Announcements" count={announcements.length} icon={Megaphone} color="#5522e0" />
      </div>

      {/* Upcoming Events */}
      <div className="flex flex-col gap-[16px]">
        <h2 className="font-outfit text-[18px] font-semibold text-[var(--text-primary)]">
          Upcoming Events
        </h2>
        {upcoming.length === 0 ? (
          <p className="font-inter text-[13px] text-[var(--text-muted)]">No upcoming events.</p>
        ) : (
          <div className="flex flex-col gap-[8px]">
            {upcoming.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between p-[16px] rounded-[10px] bg-[var(--surface)] border border-[var(--border)]"
              >
                <div className="flex flex-col gap-[2px]">
                  <span className="font-inter text-[14px] font-medium text-[var(--text-primary)]">
                    {e.title}
                  </span>
                  <span className="font-inter text-[12px] text-[var(--text-secondary)]">
                    {e.location}
                  </span>
                </div>
                <span className="font-inter text-[12px] text-[var(--text-muted)]">
                  {new Date(e.event_date).toLocaleDateString("en-MY", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
