import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useLandingContent } from "../hooks/useCms";

const MalaysiaMap = lazy(() => import("./MalaysiaMap"));

const ROTATING_WORDS = [
  "Builders Ship",
  "Creators Thrive",
  "Founders Launch",
  "Devs Innovate",
  "Dreamers Build",
];

const ROTATE_INTERVAL = 2800;

export default function Hero() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { content } = useLandingContent("hero");

  const headline = content?.headline || "Where Malaysia's";
  const subheadline = content?.subheadline || "The home for Solana builders, creators, and founders in Malaysia.\nMentorship. Grants. Hackathons. Opportunities. Community.";
  const ctaText = content?.cta_text || "Join Community";
  const ctaUrl = content?.cta_url || "";

  const rotateToNext = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
      setIsAnimating(false);
    }, 400);
  }, []);

  useEffect(() => {
    const timer = setInterval(rotateToNext, ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [rotateToNext]);

  function handleCtaClick() {
    if (ctaUrl && (ctaUrl.startsWith("http") || ctaUrl.startsWith("//"))) {
      window.open(ctaUrl, "_blank", "noopener,noreferrer");
    } else {
      navigate(ctaUrl || "/login");
    }
  }

  return (
    <section className="relative w-full min-h-[100vh] bg-[var(--background)] overflow-hidden flex items-center">
      {/* Malaysia Map */}
      <div className="absolute top-0 right-[-40px] w-[48%] h-full flex items-center justify-center">
        <div className="relative w-full h-full">
          <Suspense fallback={null}>
            <MalaysiaMap />
          </Suspense>
        </div>
      </div>

      {/* Soft brand glows */}
      <div className="absolute w-[500px] h-[500px] rounded-full right-[10%] top-[20%] opacity-20 bg-[radial-gradient(circle,var(--primary-20),transparent)] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full right-[25%] bottom-[15%] opacity-15 bg-[radial-gradient(circle,var(--secondary-12),transparent)] pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 w-full max-w-[1280px] mx-auto px-[80px] py-[120px] flex flex-col gap-[40px] pointer-events-none">
        <div className="flex flex-col gap-[4px] max-w-[560px]">
          <h1 className="font-outfit text-[72px] font-extrabold text-white tracking-[-3px] leading-[1.05] whitespace-nowrap">
            {headline}
          </h1>
          <div className="relative h-[68px] overflow-hidden">
            <h1
              className="font-outfit text-[60px] font-extrabold tracking-[-2.5px] leading-[1.1] gradient-text whitespace-nowrap transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: isAnimating ? "translateY(-100%)" : "translateY(0)",
                opacity: isAnimating ? 0 : 1,
              }}
            >
              {ROTATING_WORDS[currentIndex]}
            </h1>
          </div>
        </div>

        <p className="font-inter text-[18px] text-[var(--text-secondary)] leading-[1.8] max-w-[460px] whitespace-pre-line">
          {subheadline}
        </p>

        <div className="flex items-center gap-[16px] pt-[8px] pointer-events-auto">
          <button
            onClick={handleCtaClick}
            className="gradient-btn btn-batik rounded-[10px] px-[32px] py-[16px] font-inter text-[16px] font-semibold text-[var(--text-primary)] cursor-pointer transition-all"
          >
            <span>{ctaText}</span>
          </button>
          <button className="flex items-center gap-[8px] rounded-[10px] px-[32px] py-[16px] bg-[var(--primary-8)] border border-[var(--border-light)] font-inter text-[16px] font-medium text-[var(--text-primary)] cursor-pointer hover:bg-[var(--primary-12)] transition-colors">
            Explore Opportunities
            <span className="text-[var(--text-secondary)]">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
