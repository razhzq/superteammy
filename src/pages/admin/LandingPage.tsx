import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { LandingContent } from "../../lib/database.types";

interface SectionConfig {
  key: string;
  label: string;
  fields: { name: string; label: string; type: "text" | "textarea" | "url" }[];
}

const SECTIONS: SectionConfig[] = [
  {
    key: "hero",
    label: "Hero Section",
    fields: [
      { name: "headline", label: "Headline", type: "text" },
      { name: "subheadline", label: "Sub-headline", type: "text" },
      { name: "cta_text", label: "CTA Button Text", type: "text" },
      { name: "cta_url", label: "CTA Button URL", type: "url" },
    ],
  },
  {
    key: "stats",
    label: "Stats Section",
    fields: [
      { name: "builders_count", label: "Builders Count (e.g. 500+)", type: "text" },
      { name: "events_count", label: "Events Count (e.g. 40+)", type: "text" },
      { name: "projects_count", label: "Projects Count (e.g. 120+)", type: "text" },
      { name: "bounties_count", label: "Bounties Count (e.g. 200+)", type: "text" },
      { name: "community_count", label: "Community Reach (e.g. 10K+)", type: "text" },
    ],
  },
  {
    key: "events",
    label: "Events Section",
    fields: [
      { name: "title", label: "Section Title", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "luma_embed_url", label: "Luma Calendar URL", type: "url" },
    ],
  },
  {
    key: "join_cta",
    label: "Join CTA Section",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "button_text", label: "Button Text", type: "text" },
      { name: "button_url", label: "Button URL", type: "url" },
    ],
  },
];

export default function LandingPage() {
  const [data, setData] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: rows } = await supabase.from("landing_content").select("*");
      const map: Record<string, Record<string, string>> = {};
      (rows as LandingContent[] | null)?.forEach((row) => {
        map[row.section] = row.content_json as Record<string, string>;
      });
      setData(map);
      setLoading(false);
    }
    load();
  }, []);

  function updateField(section: string, field: string, value: string) {
    setData((prev) => ({
      ...prev,
      [section]: { ...(prev[section] ?? {}), [field]: value },
    }));
  }

  async function handleSave(sectionKey: string) {
    setSaving(sectionKey);
    const content = data[sectionKey] ?? {};

    const { data: existing } = await supabase
      .from("landing_content")
      .select("id")
      .eq("section", sectionKey)
      .single();

    if (existing) {
      await supabase
        .from("landing_content")
        .update({ content_json: content as Record<string, unknown> })
        .eq("section", sectionKey);
    } else {
      await supabase
        .from("landing_content")
        .insert({ section: sectionKey, content_json: content as Record<string, unknown> });
    }

    setSaving(null);
  }

  const inputClass =
    "px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--primary-accent)]";

  if (loading) {
    return (
      <div className="flex flex-col gap-[24px] p-[40px] max-w-[1000px]">
        <p className="font-inter text-[13px] text-[var(--text-muted)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[24px] p-[40px] max-w-[1000px]">
      <div className="flex flex-col gap-[4px]">
        <h1 className="font-outfit text-[28px] font-bold text-[var(--text-primary)] tracking-[-1px]">
          Landing Page
        </h1>
        <p className="font-inter text-[14px] text-[var(--text-secondary)]">
          Edit landing page section content.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <div
          key={section.key}
          className="flex flex-col gap-[16px] p-[24px] rounded-[14px] bg-[var(--surface)] border border-[var(--border)]"
        >
          <div className="flex items-center justify-between">
            <span className="font-outfit text-[16px] font-semibold text-[var(--text-primary)]">
              {section.label}
            </span>
            <button
              onClick={() => handleSave(section.key)}
              disabled={saving === section.key}
              className="flex items-center gap-[6px] px-[14px] py-[8px] rounded-[8px] bg-[var(--primary)] font-inter text-[12px] font-semibold text-white cursor-pointer hover:brightness-110 transition-all disabled:opacity-50"
            >
              <Save size={13} />
              {saving === section.key ? "Saving..." : "Save"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-[12px]">
            {section.fields.map((field) =>
              field.type === "textarea" ? (
                <textarea
                  key={field.name}
                  value={data[section.key]?.[field.name] ?? ""}
                  onChange={(e) => updateField(section.key, field.name, e.target.value)}
                  placeholder={field.label}
                  rows={3}
                  className={`${inputClass} resize-none col-span-2`}
                />
              ) : (
                <input
                  key={field.name}
                  value={data[section.key]?.[field.name] ?? ""}
                  onChange={(e) => updateField(section.key, field.name, e.target.value)}
                  placeholder={field.label}
                  className={inputClass}
                />
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
