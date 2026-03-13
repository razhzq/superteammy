import { Calendar, Coins, Briefcase, GraduationCap, Network } from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";

/* ── Pillar icon animations ── */

const CODE_LINES = [
  { prompt: ">", text: " const program = new SolanaProgram()" },
  { prompt: ">", text: " program.deploy()" },
];
const HOVER_LINE = { prompt: ">", text: " // shipped ✓" };

function CodeTypingIcon({ isHovered }: { color?: string; isHovered: boolean }) {
  const [displayLines, setDisplayLines] = useState<{ prompt: string; text: string; chars: number }[]>([]);
  const [cursorLine, setCursorLine] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pause" | "clear">("typing");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speed = isHovered ? 30 : 55;

  const reset = useCallback(() => {
    setDisplayLines([]);
    setCursorLine(0);
    setPhase("typing");
  }, []);

  useEffect(() => {
    if (phase === "clear") {
      const t = setTimeout(reset, 600);
      return () => clearTimeout(t);
    }

    if (phase === "pause") {
      const t = setTimeout(() => setPhase("clear"), 1200);
      return () => clearTimeout(t);
    }

    // typing phase
    const lines = isHovered ? [...CODE_LINES, HOVER_LINE] : CODE_LINES;
    const lineIndex = cursorLine;

    if (lineIndex >= lines.length) {
      setPhase("pause");
      return;
    }

    const target = lines[lineIndex];
    const current = displayLines[lineIndex];
    const currentChars = current?.chars ?? 0;

    if (currentChars >= target.text.length) {
      // line done, move to next
      const t = setTimeout(() => setCursorLine(lineIndex + 1), 200);
      return () => clearTimeout(t);
    }

    intervalRef.current = setInterval(() => {
      setDisplayLines((prev) => {
        const next = [...prev];
        const entry = next[lineIndex];
        if (!entry) {
          next[lineIndex] = { prompt: target.prompt, text: target.text, chars: 1 };
        } else if (entry.chars < target.text.length) {
          next[lineIndex] = { ...entry, chars: entry.chars + 1 };
        }
        return next;
      });
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, cursorLine, displayLines, isHovered, speed, reset]);

  // Check if current line typing is complete to advance
  useEffect(() => {
    if (phase !== "typing") return;
    const lines = isHovered ? [...CODE_LINES, HOVER_LINE] : CODE_LINES;
    const current = displayLines[cursorLine];
    const target = lines[cursorLine];
    if (current && target && current.chars >= target.text.length) {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [displayLines, cursorLine, phase, isHovered]);

  return (
    <div className="flex flex-col gap-[2px] rounded-[6px] bg-[var(--background)] border border-[var(--border)] px-[10px] py-[8px] w-full max-w-[240px] overflow-hidden">
      <AnimatePresence mode="popLayout">
        {displayLines.map((line, i) => (
          <motion.div
            key={`${i}-${line.text}`}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center font-mono text-[10px] leading-[1.6] whitespace-nowrap"
          >
            <span className="text-[var(--text-muted)] mr-[4px] select-none">{line.prompt}</span>
            <span className="text-[var(--primary-accent)]">
              {line.text.slice(0, line.chars)}
            </span>
            {i === cursorLine && phase === "typing" && (
              <motion.span
                className="inline-block w-[5px] h-[12px] ml-[1px] bg-[var(--secondary)]"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      {displayLines.length === 0 && (
        <div className="flex items-center font-mono text-[10px] leading-[1.6]">
          <span className="text-[var(--text-muted)] mr-[4px] select-none">{">"}</span>
          <motion.span
            className="inline-block w-[5px] h-[12px] bg-[var(--secondary)]"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
          />
        </div>
      )}
    </div>
  );
}

function EventBroadcastIcon({ isHovered }: { color?: string; isHovered: boolean }) {
  const duration = isHovered ? 2.2 : 3.2;
  const stagger = duration / 2;

  return (
    <div className="relative flex items-center justify-center w-[48px] h-[48px]">
      {/* Ripple layer 1 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 24,
          height: 24,
          border: "1.5px solid #ffd9a1",
        }}
        animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
        transition={{ duration, ease: "easeOut", repeat: Infinity }}
      />
      {/* Ripple layer 2 (staggered) */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 24,
          height: 24,
          border: "1.5px solid #ffd9a1",
        }}
        animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
        transition={{ duration, ease: "easeOut", repeat: Infinity, delay: stagger }}
      />
      {/* Ripple layer 3 — hover only */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 24,
              height: 24,
              border: "1px solid #ffd9a1",
            }}
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration * 0.8, ease: "easeOut", repeat: Infinity, delay: stagger * 0.5 }}
          />
        )}
      </AnimatePresence>
      {/* Center icon */}
      <Calendar size={24} color="var(--secondary)" className="relative z-10" />
    </div>
  );
}

function FloatIcon({ color }: { color: string; isHovered?: boolean }) {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.8, ease: "easeInOut", repeat: Infinity }}
    >
      <Coins size={24} color={color} />
    </motion.div>
  );
}

function BounceIcon({ color }: { color: string; isHovered?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: [0, -4, 0] }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Briefcase size={24} color={color} />
    </motion.div>
  );
}

function RotateIcon({ color }: { color: string; isHovered?: boolean }) {
  return (
    <motion.div
      animate={{ rotate: [0, 8, -8, 0] }}
      transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
    >
      <GraduationCap size={24} color={color} />
    </motion.div>
  );
}

function NetworkPulseIcon({ color }: { color: string; isHovered?: boolean }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity }}
    >
      <Network size={24} color={color} />
    </motion.div>
  );
}

/* ── Pillar data ── */

const pillars = [
  {
    IconComponent: CodeTypingIcon,
    color: "var(--primary-accent)",
    title: "Builder Support\n& Mentorship",
    desc: "1-on-1 mentorship from experienced Solana builders.",
    hasHoverState: true,
  },
  {
    IconComponent: EventBroadcastIcon,
    color: "var(--secondary)",
    title: "Events &\nHackathons",
    desc: "Regular meetups, workshops, and hackathon events.",
    hasHoverState: true,
  },
  {
    IconComponent: FloatIcon,
    color: "var(--primary-accent)",
    title: "Grants &\nFunding",
    desc: "Access to Solana ecosystem grants and funding.",
  },
  {
    IconComponent: BounceIcon,
    color: "var(--secondary)",
    title: "Jobs, Bounties\n& Opportunities",
    desc: "Earn through bounties and find roles in Solana projects.",
  },
  {
    IconComponent: RotateIcon,
    color: "var(--primary-accent)",
    title: "Education &\nWorkshops",
    desc: "Hands-on workshops and learning programs.",
  },
  {
    IconComponent: NetworkPulseIcon,
    color: "var(--secondary)",
    title: "Ecosystem\nConnections",
    desc: "Connect with founders, VCs, and protocols globally.",
  },
];

/* ── Card component ── */

function PillarCard({
  pillar,
  index,
}: {
  pillar: (typeof pillars)[number];
  index: number;
}) {
  const { IconComponent, color, title, desc } = pillar;
  const [isHovered, setIsHovered] = useState(false);
  const hasHoverState = "hasHoverState" in pillar && pillar.hasHoverState;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.08,
      }}
      whileHover={{
        y: -4,
        scale: 1.01,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="flex flex-col gap-[16px] p-[28px] rounded-[14px] bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--border-light)] transition-colors"
    >
      {hasHoverState ? (
        <IconComponent color={color} isHovered={isHovered} />
      ) : (
        <div className="w-[24px] h-[24px]">
          <IconComponent color={color} isHovered={false} />
        </div>
      )}
      <h3 className="font-outfit text-[17px] font-semibold text-[var(--text-primary)] leading-[1.3] whitespace-pre-line">
        {title}
      </h3>
      <p className="font-inter text-[13px] text-[var(--text-secondary)] leading-[1.6]">
        {desc}
      </p>
    </motion.div>
  );
}

/* ── Section ── */

export default function Mission() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="mission" className="w-full bg-[var(--background)]">
      <div
        ref={sectionRef}
        className="flex flex-col items-center gap-[64px] w-full max-w-[1280px] mx-auto px-[80px] py-[120px]"
      >
        {/* Header */}
        <motion.div
          className="flex flex-col items-center gap-[16px]"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="font-inter text-[12px] font-semibold text-[var(--secondary)] tracking-[3px]">
            WHAT WE DO
          </span>
          <h2 className="font-outfit text-[44px] font-bold text-[var(--text-primary)] tracking-[-2px] leading-[1.15] text-center max-w-[700px]">
            Building the Solana ecosystem
            <br />
            in Malaysia.
          </h2>
        </motion.div>

        {/* Pillars Grid */}
        {isInView && (
          <div className="grid grid-cols-3 gap-[20px] w-full">
            {pillars.map((p, i) => (
              <PillarCard key={p.title} pillar={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
