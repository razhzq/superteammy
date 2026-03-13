import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticated, profile, role, logout, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isHome = location.pathname === "/";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close dropdown and mobile menu on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const NAV_LINKS = isHome
    ? [
        { label: "Mission", href: "#mission" },
        { label: "Events", href: "#events" },
        { label: "Community", href: "#community" },
        { label: "FAQ", href: "#faq" },
      ]
    : [];

  const displayName =
    profile?.full_name ??
    profile?.email?.split("@")[0] ??
    "User";

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleLogout() {
    setDropdownOpen(false);
    await logout();
    navigate("/");
  }

  return (
    <nav className="w-full sticky top-0 z-50 bg-[var(--background)]/60 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center justify-between w-full max-w-[1280px] mx-auto h-[64px] px-[20px] md:px-[80px]">
        {/* Logo */}
        <div
          className="flex items-center gap-[10px] cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src="/superteam-white.png"
            alt="Superteam"
            className="w-[24px] h-[24px]"
          />
          <span className="font-outfit text-[18px] font-bold tracking-[-0.3px]">
            <span className="text-white">Superteam</span>
            <span className="text-white/40">MY</span>
          </span>
        </div>

        {/* Center links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-[32px]">
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-inter text-[13px] font-medium text-white/50 hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}

          <button
            onClick={() => navigate("/directory")}
            className={`font-inter text-[13px] font-medium transition-colors cursor-pointer ${
              location.pathname === "/directory"
                ? "text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            Directory
          </button>
        </div>

        {/* Right side — desktop */}
        <div className="hidden md:flex items-center">
          {isHome ? (
            <button
              onClick={() => navigate("/login")}
              className="rounded-[10px] px-[22px] py-[9px] font-inter text-[13px] font-semibold text-white cursor-pointer transition-all hover:brightness-110 shadow-[0_2px_12px_rgba(85,34,224,0.25)]"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--secondary))",
              }}
            >
              Launch App
            </button>
          ) : !loading && authenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-[10px] cursor-pointer rounded-[10px] px-[10px] py-[6px] hover:bg-white/[0.06] transition-colors"
              >
                <div
                  className="flex items-center justify-center w-[32px] h-[32px] rounded-full shrink-0"
                  style={{
                    background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                  }}
                >
                  <span className="font-inter text-[11px] font-bold text-white">
                    {initials}
                  </span>
                </div>
                <span className="font-inter text-[13px] font-medium text-white/80 max-w-[120px] truncate">
                  {displayName}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-white/40 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+8px)] w-[220px] rounded-[12px] border border-white/[0.08] overflow-hidden"
                  style={{
                    background: "rgba(18, 18, 22, 0.95)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  }}
                >
                  <div className="px-[16px] py-[14px] border-b border-white/[0.06]">
                    <p className="font-inter text-[13px] font-medium text-white truncate">
                      {displayName}
                    </p>
                    {profile?.email && (
                      <p className="font-inter text-[11px] text-white/40 truncate mt-[2px]">
                        {profile.email}
                      </p>
                    )}
                    {role && (
                      <span className="inline-block mt-[8px] px-[8px] py-[2px] rounded-full bg-[var(--primary-8)] font-inter text-[10px] font-semibold text-[var(--primary-accent)] uppercase">
                        {role}
                      </span>
                    )}
                  </div>

                  <div className="py-[6px]">
                    {(role === "admin" || role === "editor") && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate("/admin");
                        }}
                        className="flex items-center gap-[10px] w-full px-[16px] py-[10px] font-inter text-[13px] text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                      >
                        <Shield size={14} />
                        Admin Portal
                      </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-[10px] w-full px-[16px] py-[10px] font-inter text-[13px] text-white/70 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="rounded-[8px] px-[20px] py-[8px] font-inter text-[13px] font-semibold text-white cursor-pointer transition-all border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.15]"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden items-center justify-center w-[40px] h-[40px] cursor-pointer bg-transparent border-0 text-white"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden flex flex-col gap-[4px] px-[20px] pb-[20px] border-t border-white/[0.06] bg-[var(--background)]/95 backdrop-blur-xl">
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="font-inter text-[15px] font-medium text-white/60 hover:text-white py-[12px] border-b border-white/[0.04] transition-colors"
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={() => { setMobileMenuOpen(false); navigate("/directory"); }}
            className={`text-left font-inter text-[15px] font-medium py-[12px] border-b border-white/[0.04] transition-colors cursor-pointer bg-transparent border-x-0 border-t-0 ${
              location.pathname === "/directory" ? "text-white" : "text-white/60 hover:text-white"
            }`}
          >
            Directory
          </button>
          {isHome ? (
            <button
              onClick={() => { setMobileMenuOpen(false); navigate("/login"); }}
              className="mt-[8px] rounded-[10px] px-[22px] py-[12px] font-inter text-[14px] font-semibold text-white cursor-pointer transition-all shadow-[0_2px_12px_rgba(85,34,224,0.25)]"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
            >
              Launch App
            </button>
          ) : !loading && authenticated ? (
            <div className="flex flex-col gap-[4px] mt-[8px]">
              {(role === "admin" || role === "editor") && (
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate("/admin"); }}
                  className="flex items-center gap-[10px] py-[12px] font-inter text-[15px] text-white/60 hover:text-white cursor-pointer bg-transparent border-0 transition-colors"
                >
                  <Shield size={16} /> Admin Portal
                </button>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="flex items-center gap-[10px] py-[12px] font-inter text-[15px] text-red-400 cursor-pointer bg-transparent border-0 transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setMobileMenuOpen(false); navigate("/login"); }}
              className="mt-[8px] rounded-[8px] px-[20px] py-[12px] font-inter text-[14px] font-semibold text-white cursor-pointer border border-white/[0.08] bg-white/[0.04]"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
