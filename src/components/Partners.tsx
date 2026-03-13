import { usePartners } from "../hooks/useCms";

const FALLBACK_PARTNERS = [
  { name: "MagicBlock", logo_url: "/magicblock.png" },
  { name: "Colosseum", logo_url: "/colosseum.png" },
  { name: "NS", logo_url: "/ns.png" },
  { name: "Solana", logo_url: "/solanaLogo.png" },
];

export default function Partners() {
  const { data: partners, loading } = usePartners(true);

  const list = partners.length > 0
    ? partners.map((p) => ({ name: p.name, logo_url: p.logo_url }))
    : loading
      ? []
      : FALLBACK_PARTNERS;

  // Repeat for scrolling tape effect
  const tape = [...list, ...list, ...list, ...list];

  return (
    <section className="relative w-full bg-[var(--background)] overflow-hidden">
      <div className="flex flex-col items-center gap-[40px] md:gap-[56px] w-full max-w-[1280px] mx-auto px-[20px] md:px-[80px] pt-[60px] md:pt-[100px] pb-[40px] md:pb-[80px]">
        {/* Header */}
        <div className="flex flex-col items-center gap-[16px]">
          <span className="font-inter text-[12px] font-semibold text-[var(--secondary)] tracking-[3px]">
            ECOSYSTEM
          </span>
          <h2 className="font-outfit text-[28px] md:text-[40px] font-bold text-[var(--text-primary)] tracking-[-1px] md:tracking-[-1.5px]">
            Partners & ecosystem.
          </h2>
        </div>
      </div>

      {/* Scrolling tape */}
      <div className="relative w-full pb-[100px]">
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-[40px] md:w-[120px] z-10 pointer-events-none" style={{ background: "linear-gradient(to right, var(--background), transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-[40px] md:w-[120px] z-10 pointer-events-none" style={{ background: "linear-gradient(to left, var(--background), transparent)" }} />

        {tape.length > 0 ? (
          <div className="flex gap-[24px] animate-scroll-left">
            {tape.map((p, i) => (
              <div
                key={`p-${i}`}
                className="flex items-center justify-center shrink-0 px-[28px] py-[18px] rounded-[14px] bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--border-light)] transition-colors"
              >
                <img
                  src={p.logo_url}
                  alt={p.name}
                  className="h-[32px] w-auto object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-[40px]">
            <div className="w-[24px] h-[24px] border-2 border-[var(--primary-accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </section>
  );
}
