import { useMembers } from "../hooks/useCms";
import type { Member } from "../lib/database.types";

const FALLBACK_BUILDERS = [
  {
    name: "Amir Razak",
    role: "Full-Stack Dev",
    company: "SolanaFM",
    avatar_url: "/melayu.png",
    skills: ["Dev", "Hackathon Winner"],
  },
  {
    name: "Wei Chen",
    role: "Founder",
    company: "PayHalal",
    avatar_url: "/chinese-warrior.png",
    skills: ["BizDev", "Solana Builder"],
  },
  {
    name: "Daniel Lim",
    role: "Smart Contract Dev",
    company: "Raydium",
    avatar_url: "/indian-warrior.png",
    skills: ["Rust", "Security"],
  },
];

function BuilderCard({ member }: { member: Member | (typeof FALLBACK_BUILDERS)[0] }) {
  const portrait = "avatar_url" in member ? member.avatar_url : null;
  const skills = member.skills ?? [];
  const roleCompany = "company" in member && member.company
    ? `${member.role} · ${member.company}`
    : member.role;

  return (
    <div className="group flex flex-col rounded-[14px] bg-[var(--surface-elevated)] border border-[var(--border)] overflow-hidden transition-all duration-300 ease-out hover:border-[var(--border-light)] hover:-translate-y-[4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
      {/* Portrait image */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4 / 5" }}>
        {portrait ? (
          <img
            src={portrait}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]" />
        )}
        {/* Cinematic gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 50%, rgba(22,22,26,0.6) 80%, rgba(22,22,26,0.95) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-[12px] px-[24px] pt-[20px] pb-[24px]">
        <div className="flex flex-col gap-[4px]">
          <span className="font-outfit text-[16px] font-semibold text-[var(--text-primary)]">
            {member.name}
          </span>
          <span className="font-inter text-[12px] text-[var(--text-secondary)]">
            {roleCompany}
          </span>
        </div>
        <div className="flex flex-wrap gap-[6px]">
          {skills.slice(0, 3).map((s, i) => (
            <span
              key={s}
              className="rounded-full px-[10px] py-[4px] font-inter text-[10px] font-medium"
              style={{
                backgroundColor: i % 2 === 0 ? "var(--primary-8)" : "var(--secondary-8)",
                color: i % 2 === 0 ? "var(--primary-accent)" : "var(--secondary)",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Members() {
  const { data: members, loading } = useMembers(true, true);

  // Use CMS data if available, otherwise fallback
  const builders = members.length > 0 ? members : (loading ? [] : FALLBACK_BUILDERS);

  return (
    <section id="community" className="w-full bg-[var(--surface)]">
      <div className="flex flex-col items-center gap-[64px] w-full max-w-[1280px] mx-auto px-[80px] py-[120px]">
        {/* Header */}
        <div className="flex flex-col items-center gap-[16px]">
          <span className="font-inter text-[12px] font-semibold text-[var(--primary-accent)] tracking-[3px]">
            COMMUNITY
          </span>
          <h2 className="font-outfit text-[40px] font-bold text-[var(--text-primary)] tracking-[-1.5px]">
            Meet the builders.
          </h2>
          <p className="font-inter text-[16px] text-[var(--text-secondary)] text-center max-w-[520px]">
            Developers, designers and operators building the future of Web3 in Malaysia.
          </p>
        </div>

        {/* Builder Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-[40px]">
            <div className="w-[24px] h-[24px] border-2 border-[var(--primary-accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-[28px] w-full max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
            {builders.map((b) => (
              <BuilderCard key={b.name} member={b as Member} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
