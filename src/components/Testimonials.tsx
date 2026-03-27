const testimonials = [
  {
    quote:
      "\u201CAncora Imparo connected me with the right people and my project got funded within weeks. The community is incredibly supportive.\u201D",
    name: "Hafiz Ibrahim",
    role: "DeFi Builder",
    gradient: "from-[var(--primary-25)] to-[var(--secondary-20)]",
  },
  {
    quote:
      "\u201CThe hackathon prep sessions are world-class. I went from zero Solana experience to winning a bounty in 3 months.\u201D",
    name: "Jun Wei Lim",
    role: "Solana Developer",
    gradient: "from-[var(--secondary-25)] to-[var(--primary-20)]",
  },
  {
    quote:
      "\u201CFinally a Web3 community in Malaysia that\u2019s about building, not speculation. The energy here is real.\u201D",
    name: "Aisyah Kamal",
    role: "Product Designer",
    gradient: "from-[var(--primary-20)] to-[var(--secondary-25)]",
  },
];

export default function Testimonials() {
  return (
    <section className="w-full bg-[var(--surface)]">
      <div className="flex flex-col items-center gap-[32px] md:gap-[48px] w-full max-w-[1280px] mx-auto px-[20px] md:px-[80px] py-[60px] md:py-[100px]">
      {/* Header */}
      <div className="flex flex-col items-center gap-[16px]">
        <span className="font-inter text-[12px] font-semibold text-[var(--primary-accent)] tracking-[3px]">
          WALL OF LOVE
        </span>
        <h2 className="font-outfit text-[28px] md:text-[40px] font-bold text-[var(--text-primary)] tracking-[-1px] md:tracking-[-1.5px]">
          What builders say.
        </h2>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] md:gap-[20px] w-full">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="flex flex-col gap-[16px] p-[28px] rounded-[14px] bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--border-light)] transition-colors"
          >
            <p className="font-inter text-[14px] text-[var(--text-secondary)] leading-[1.7] flex-1">
              {t.quote}
            </p>
            <div className="flex items-center gap-[12px]">
              <div
                className={`w-[32px] h-[32px] rounded-full bg-gradient-to-br ${t.gradient} shrink-0`}
              />
              <div className="flex flex-col gap-[2px]">
                <span className="font-outfit text-[14px] font-semibold text-[var(--text-primary)]">
                  {t.name}
                </span>
                <span className="font-inter text-[11px] text-[var(--text-muted)]">
                  {t.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
