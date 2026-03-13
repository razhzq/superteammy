import { useLandingContent } from "../hooks/useCms";

export default function JoinCTA() {
  const { content } = useLandingContent("join_cta");

  const title = content?.title || "Ready to build\nthe future?";
  const description = content?.description || "Join 500+ builders shaping Malaysia's Solana ecosystem.";
  const buttonText = content?.button_text || "Join Telegram";
  const buttonUrl = content?.button_url || "#";

  const titleParts = title.split("\n");

  return (
    <section className="w-full bg-[var(--surface)]">
      <div className="flex flex-col items-center justify-center gap-[28px] md:gap-[40px] w-full max-w-[1280px] mx-auto px-[20px] md:px-[80px] py-[60px] md:py-[120px]">
        <h2 className="font-outfit text-[32px] md:text-[56px] font-extrabold text-[var(--text-primary)] tracking-[-1.5px] md:tracking-[-2.5px] leading-[1.1] text-center max-w-[600px]">
          {titleParts.length > 1 ? (
            <>
              {titleParts[0]}
              <br />
              {titleParts.slice(1).join("\n")}
            </>
          ) : (
            title
          )}
        </h2>
        <p className="font-inter text-[15px] md:text-[18px] text-[var(--text-secondary)] text-center">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-[12px] md:gap-[16px]">
          <a
            href={buttonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-btn btn-batik rounded-[10px] px-[28px] py-[14px] font-inter text-[15px] font-semibold text-[var(--text-primary)] cursor-pointer transition-all text-center"
          >
            <span>{buttonText}</span>
          </a>
          <button className="rounded-[10px] px-[28px] py-[14px] bg-[var(--primary-8)] border border-[var(--border-light)] font-inter text-[15px] font-medium text-[var(--text-primary)] cursor-pointer hover:bg-[var(--primary-12)] transition-colors text-center">
            Join Discord
          </button>
          <button className="rounded-[10px] px-[28px] py-[14px] bg-[var(--primary-8)] border border-[var(--border-light)] font-inter text-[15px] font-medium text-[var(--text-primary)] cursor-pointer hover:bg-[var(--primary-12)] transition-colors text-center">
            Follow on X
          </button>
        </div>
      </div>
    </section>
  );
}
