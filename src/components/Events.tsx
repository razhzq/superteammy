import { useLandingContent } from "../hooks/useCms";

const DEFAULTS = {
  title: "Where builders\ncome together.",
  description: "IRL meetups, workshops, and hackathons across Malaysia.\nFind your next event below.",
  luma_embed_url: "https://luma.com/embed/calendar/cal-sZfiZHfUS5piycU/events?lt=dark",
  luma_calendar_url: "https://luma.com/calendar/cal-sZfiZHfUS5piycU",
};

export default function Events() {
  const { content } = useLandingContent("events");

  const title = content?.title || DEFAULTS.title;
  const description = content?.description || DEFAULTS.description;
  const embedUrl = content?.luma_embed_url || DEFAULTS.luma_embed_url;
  const calendarUrl = content?.luma_calendar_url || DEFAULTS.luma_calendar_url;

  // Split title at newline for gradient styling
  const titleParts = title.split("\n");

  return (
    <section id="events" className="w-full bg-[var(--background)]">
      <div className="flex items-start gap-[64px] w-full max-w-[1280px] mx-auto px-[80px] py-[120px]">
        {/* Left: Header */}
        <div className="flex flex-col gap-[20px] w-[340px] shrink-0 sticky top-[100px]">
          <span className="font-inter text-[13px] font-semibold text-[var(--secondary)] tracking-[4px] uppercase">
            Events
          </span>
          <h2 className="font-outfit text-[48px] font-extrabold text-[var(--text-primary)] tracking-[-2.5px] leading-[1.08]">
            {titleParts.length > 1 ? (
              <>
                {titleParts[0]}
                <br />
                <span className="gradient-text">{titleParts[1]}</span>
              </>
            ) : (
              title
            )}
          </h2>
          <p className="font-inter text-[16px] text-[var(--text-secondary)] leading-[1.7]">
            {description}
          </p>
          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-[8px] mt-[8px] font-inter text-[15px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors w-fit"
          >
            View full calendar on Luma
            <span>→</span>
          </a>
        </div>

        {/* Right: Luma Calendar Embed */}
        <div className="relative flex-1 rounded-[20px] overflow-hidden border border-[var(--border)]">
          <div
            className="absolute top-0 left-0 right-0 h-[2px] z-10"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--primary), var(--secondary), transparent)",
            }}
          />
          <iframe
            src={embedUrl}
            allowFullScreen
            aria-hidden="false"
            tabIndex={0}
            className="w-full border-none min-h-[75vh]"
            style={{ background: "#0a0a0c" }}
          />
        </div>
      </div>
    </section>
  );
}
