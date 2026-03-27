import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Mail,
  MessageCircle,
  Users,
  LogOut,
  QrCode,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
  { label: "Students", icon: Users, to: "/admin/students" },
  { label: "QR Registration", icon: QrCode, to: "/admin/qr-registration" },
  { label: "Email Blast", icon: Mail, to: "/admin/email-blast" },
  { label: "WhatsApp Blast", icon: MessageCircle, to: "/admin/whatsapp-blast" },
  // { label: "Members", icon: Users, to: "/admin/members" },
  // { label: "Partners", icon: Handshake, to: "/admin/partners" },
  // { label: "Projects", icon: FolderOpen, to: "/admin/projects" },
  // { label: "Announcements", icon: Megaphone, to: "/admin/announcements" },
  // { label: "Landing Page", icon: FileText, to: "/admin/landing" },
];

export default function AdminLayout() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await logout();
    navigate("/");
  }

  return (
    <div className="flex w-full min-h-screen bg-[var(--background)]">
      {/* ── Sidebar ── */}
      <aside className="flex flex-col w-[240px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)]">
        {/* Brand */}
        <div className="flex items-center gap-[10px] h-[64px] px-[20px]">
          <span className="font-outfit text-[16px] font-bold text-[var(--text-primary)]">
            Admin
          </span>
          <span className="ml-auto px-[8px] py-[2px] rounded-full bg-[var(--primary-8)] font-inter text-[10px] font-semibold text-[var(--primary-accent)] uppercase">
            {profile?.role ?? "—"}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-[2px] flex-1 px-[10px] pt-[8px]">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-[10px] px-[12px] py-[10px] rounded-[8px] font-inter text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--primary-8)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]"
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="flex items-center gap-[10px] px-[20px] py-[16px] border-t border-[var(--border)]">
          <div className="w-[28px] h-[28px] rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-inter text-[12px] font-medium text-[var(--text-primary)] truncate">
              {profile?.full_name ?? profile?.email ?? "Admin"}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="p-[6px] rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
