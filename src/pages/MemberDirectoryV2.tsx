import { useState } from "react";
import { Search, Twitter } from "lucide-react";
import Navigation from "../components/Navigation";

const PORTRAITS = ["/melayu.png", "/chinese-warrior.png", "/indian-warrior.png"];

const FILTERS = [
  "All",
  "Core Team",
  "Rust",
  "Frontend",
  "Design",
  "Content",
  "Growth",
  "Product",
  "Community",
];

interface Member {
  name: string;
  title: string;
  gradientAngle: number;
  tags: { label: string; color: "primary" | "secondary" }[];
}

const MEMBERS: Member[] = [
  {
    name: "Haziq Raz",
    title: "Product Engineer • Canopy",
    gradientAngle: 135,
    tags: [
      { label: "Rust", color: "secondary" },
      { label: "Frontend", color: "primary" },
      { label: "Solana", color: "secondary" },
      { label: "Product", color: "primary" },
    ],
  },
  {
    name: "Sarah Tan",
    title: "Design Lead • Tensor",
    gradientAngle: 180,
    tags: [
      { label: "Design", color: "primary" },
      { label: "Product", color: "secondary" },
      { label: "Figma", color: "primary" },
    ],
  },
  {
    name: "Wei Chen",
    title: "Growth Lead • Jupiter",
    gradientAngle: 45,
    tags: [
      { label: "Growth", color: "secondary" },
      { label: "Solana", color: "primary" },
      { label: "DeFi", color: "secondary" },
    ],
  },
  {
    name: "Priya Nair",
    title: "Content Lead • Marinade",
    gradientAngle: 270,
    tags: [
      { label: "Content", color: "secondary" },
      { label: "Community", color: "primary" },
      { label: "Writing", color: "secondary" },
    ],
  },
  {
    name: "Amir Razak",
    title: "Smart Contract Dev • Raydium",
    gradientAngle: 90,
    tags: [
      { label: "Rust", color: "secondary" },
      { label: "Solana", color: "primary" },
      { label: "Security", color: "secondary" },
    ],
  },
  {
    name: "Nurul Aisyah",
    title: "Protocol Engineer • Orca",
    gradientAngle: 200,
    tags: [
      { label: "Rust", color: "primary" },
      { label: "Backend", color: "secondary" },
      { label: "DeFi", color: "primary" },
    ],
  },
  {
    name: "Daniel Lim",
    title: "Frontend Dev • Metaplex",
    gradientAngle: 315,
    tags: [
      { label: "Frontend", color: "secondary" },
      { label: "React", color: "primary" },
      { label: "TypeScript", color: "secondary" },
    ],
  },
  {
    name: "Mei Ling Chong",
    title: "Community Manager • Superteam",
    gradientAngle: 160,
    tags: [
      { label: "Community", color: "secondary" },
      { label: "Events", color: "primary" },
      { label: "Growth", color: "secondary" },
    ],
  },
];

function TagBadge({ label, color }: { label: string; color: "primary" | "secondary" }) {
  const isPrimary = color === "primary";
  return (
    <span
      className="inline-flex items-center rounded-full px-[14px] py-[5px] font-inter text-[12px] font-medium"
      style={{
        color: isPrimary ? "var(--primary-accent)" : "var(--secondary)",
        background: isPrimary ? "var(--primary-8)" : "var(--secondary-8)",
      }}
    >
      {label}
    </span>
  );
}

function MemberCard({ member, index }: { member: Member; index: number }) {
  return (
    <div className="flex items-center gap-[24px] w-full rounded-[14px] bg-[var(--surface)] border border-[var(--border)] px-[28px] py-[20px] hover:border-[var(--border-light)] transition-colors">
      {/* Avatar */}
      <img
        src={PORTRAITS[index % PORTRAITS.length]}
        alt={member.name}
        className="w-[48px] h-[48px] shrink-0 rounded-full object-cover"
      />

      {/* Info */}
      <div className="flex flex-col gap-[2px] w-[220px] shrink-0">
        <span className="font-inter text-[15px] font-semibold text-[var(--text-primary)] tracking-[-0.3px]">
          {member.name}
        </span>
        <span className="font-inter text-[13px] text-[var(--text-secondary)]">
          {member.title}
        </span>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-[8px] flex-1">
        {member.tags.map((tag) => (
          <TagBadge key={tag.label} label={tag.label} color={tag.color} />
        ))}
      </div>

      {/* Social */}
      <div className="flex items-center justify-center w-[32px] h-[32px] shrink-0">
        <Twitter className="w-[16px] h-[16px] text-[var(--text-muted)]" />
      </div>
    </div>
  );
}

export default function MemberDirectoryV2() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className="relative flex flex-col w-full min-h-screen bg-[var(--background)]">
      {/* Subtle batik background at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[500px] pointer-events-none"
        style={{
          backgroundImage: "url(/digital-batik.png)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          filter: "brightness(0.06) saturate(0.3)",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
        }}
      />

      <Navigation />

      {/* Header */}
      <div className="relative flex flex-col items-center gap-[16px] w-full pt-[80px] px-[40px]">
        <h1 className="font-outfit text-[40px] font-bold text-[var(--text-primary)] tracking-[-1.2px] text-center">
          Superteam Malaysia Contributors
        </h1>
        <p className="font-inter text-[16px] text-[var(--text-secondary)] text-center max-w-[600px]">
          Discover developers, designers, and operators building the ecosystem.
        </p>
      </div>

      {/* Search */}
      <div className="relative flex items-center justify-center w-full pt-[40px] px-[40px]">
        <div className="flex items-center gap-[12px] w-[720px] h-[56px] rounded-[16px] bg-[var(--surface-elevated)] border border-[var(--border)] px-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
          <Search className="w-[20px] h-[20px] text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search members, skills, or companies"
            className="flex-1 bg-transparent font-inter text-[15px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="relative flex items-center justify-center gap-[10px] w-full pt-[32px] pb-[40px] px-[40px]">
        {FILTERS.map((filter) => {
          const isActive = filter === activeFilter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className="font-inter text-[14px] rounded-full px-[20px] py-[8px] cursor-pointer transition-all"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, var(--primary), var(--secondary))"
                  : "var(--surface-elevated)",
                color: isActive ? "#fff" : "var(--text-secondary)",
                fontWeight: isActive ? 600 : 500,
                border: isActive ? "none" : "1px solid var(--border)",
              }}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Member List */}
      <div className="relative flex flex-col gap-[12px] w-full px-[80px] pb-[80px]">
        {/* List Header */}
        <div className="flex items-center gap-[24px] w-full px-[28px] opacity-50">
          <div className="w-[48px]" />
          <div className="w-[220px]">
            <span className="font-inter text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.8px] uppercase">
              Member
            </span>
          </div>
          <div className="flex-1">
            <span className="font-inter text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.8px] uppercase">
              Skills
            </span>
          </div>
          <div className="w-[32px]">
            <span className="font-inter text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.8px] uppercase">
              Social
            </span>
          </div>
        </div>

        {/* Member Cards */}
        {MEMBERS.map((member, i) => (
          <MemberCard key={member.name} member={member} index={i} />
        ))}

        {/* Footer */}
        <div className="flex items-center justify-center w-full pt-[16px]">
          <span className="font-inter text-[13px] text-[var(--text-muted)]">
            Showing 8 of 142 contributors
          </span>
        </div>
      </div>
    </div>
  );
}
