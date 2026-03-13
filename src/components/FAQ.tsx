import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  "What is Superteam Malaysia?",
  "How do I join?",
  "What opportunities are available?",
  "How can projects collaborate with us?",
  "Do I need to be a developer to join?",
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="w-full bg-[var(--background)]">
      <div className="flex flex-col items-center gap-[32px] md:gap-[48px] w-full max-w-[1280px] mx-auto px-[20px] md:px-[80px] py-[60px] md:py-[100px]">
      {/* Header */}
      <div className="flex flex-col items-center gap-[16px]">
        <span className="font-inter text-[12px] font-semibold text-[var(--secondary)] tracking-[3px]">
          FAQ
        </span>
        <h2 className="font-outfit text-[28px] md:text-[40px] font-bold text-[var(--text-primary)] tracking-[-1px] md:tracking-[-1.5px]">
          Common questions.
        </h2>
      </div>

      {/* FAQ List */}
      <div className="flex flex-col w-full max-w-[720px]">
        {faqs.map((q, i) => (
          <div key={q}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex items-center justify-between w-full py-[24px] cursor-pointer bg-transparent border-0"
            >
              <span className="font-outfit text-[17px] font-semibold text-[var(--text-primary)]">
                {q}
              </span>
              {openIndex === i ? (
                <Minus size={18} color="var(--text-muted)" />
              ) : (
                <Plus size={18} color="var(--text-muted)" />
              )}
            </button>
            {i < faqs.length - 1 && (
              <div className="w-full h-[1px] bg-[var(--border)]" />
            )}
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
