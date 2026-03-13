import { useEffect, useRef, useState } from "react";
import { useLandingContent } from "../hooks/useCms";

const DEFAULT_STATS = [
  { value: 500, suffix: "+", label: "Members", gradient: true },
  { value: 40, suffix: "+", label: "Events Hosted", gradient: false },
  { value: 120, suffix: "+", label: "Projects Built", gradient: false },
  { value: 200, suffix: "+", label: "Bounties Done", gradient: false },
  { value: 10, suffix: "K+", label: "Community Reach", gradient: true, reverse: true },
];

function parseStatValue(raw: string | undefined, fallback: number): { value: number; suffix: string } {
  if (!raw) return { value: fallback, suffix: "+" };
  // Parse values like "500+", "10K+", "120+"
  const match = raw.match(/^(\d+)\s*(.*)$/);
  if (match) return { value: parseInt(match[1], 10), suffix: match[2] || "+" };
  return { value: fallback, suffix: "+" };
}

function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let raf: number;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);

  return count;
}

function AnimatedStat({
  value,
  suffix,
  label,
  gradient,
  reverse,
  inView,
}: {
  value: number;
  suffix: string;
  label: string;
  gradient: boolean;
  reverse?: boolean;
  inView: boolean;
}) {
  const count = useCountUp(value, 2000, inView);

  return (
    <div className="flex flex-col items-center gap-[8px]">
      <span
        className={`font-outfit text-[56px] font-extrabold tracking-[-2px] tabular-nums ${
          gradient
            ? reverse
              ? "gradient-text-reverse"
              : "gradient-text"
            : "text-[var(--text-primary)]"
        }`}
      >
        {inView ? count : 0}
        {suffix}
      </span>
      <span className="font-inter text-[14px] text-[var(--text-secondary)]">
        {label}
      </span>
    </div>
  );
}

export default function Stats() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const { content } = useLandingContent("stats");

  // Build stats from CMS or fallback
  const stats = DEFAULT_STATS.map((def, i) => {
    if (!content) return def;
    const keys = ["builders_count", "events_count", "projects_count", "bounties_count", "community_count"];
    const raw = content[keys[i]];
    if (!raw) return def;
    const { value, suffix } = parseStatValue(raw, def.value);
    return { ...def, value, suffix };
  });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full bg-[var(--surface)]">
      <div
        ref={sectionRef}
        className="flex flex-col items-center gap-[64px] w-full max-w-[1280px] mx-auto px-[80px] py-[100px]"
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-[16px]">
          <span className="font-inter text-[12px] font-semibold text-[var(--primary-accent)] tracking-[3px]">
            OUR IMPACT
          </span>
          <h2 className="font-outfit text-[40px] font-bold text-[var(--text-primary)] tracking-[-1.5px] text-center">
            Growing Malaysia's builder ecosystem.
          </h2>
        </div>

        {/* Stats Row */}
        <div className="flex justify-between w-full">
          {stats.map((s) => (
            <AnimatedStat
              key={s.label}
              value={s.value}
              suffix={s.suffix}
              label={s.label}
              gradient={s.gradient}
              reverse={s.reverse}
              inView={inView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
