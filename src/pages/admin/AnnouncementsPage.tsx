import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, uploadFile } from "../../hooks/useCms";
import type { Announcement, ContentStatus } from "../../lib/database.types";
import { useAuth } from "../../context/AuthContext";

type FormData = Omit<Announcement, "id" | "created_at" | "updated_at">;
const EMPTY: FormData = { title: "", content: "", cover_image_url: null, status: "draft", published_at: null };

export default function AnnouncementsPage() {
  const { data: items, loading, refetch } = useAnnouncements();
  const { role } = useAuth();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `announcements/${Date.now()}-${file.name}`;
    const { url } = await uploadFile("media", path, file);
    if (url) setForm({ ...form, cover_image_url: url });
    setUploading(false);
  }

  function openCreate() { setEditing(null); setForm(EMPTY); setShowForm(true); setPreview(false); }
  function openEdit(a: Announcement) {
    setEditing(a.id);
    setForm({ title: a.title, content: a.content, cover_image_url: a.cover_image_url, status: a.status, published_at: a.published_at });
    setShowForm(true);
    setPreview(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { ...form };
    if (data.status === "published" && !data.published_at) {
      data.published_at = new Date().toISOString();
    }
    if (editing) await updateAnnouncement(editing, data);
    else await createAnnouncement(data);
    setShowForm(false);
    refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await deleteAnnouncement(id);
    refetch();
  }

  async function toggleStatus(a: Announcement) {
    const next: ContentStatus = a.status === "published" ? "draft" : "published";
    await updateAnnouncement(a.id, {
      status: next,
      published_at: next === "published" ? new Date().toISOString() : null,
    });
    refetch();
  }

  const inputClass = "px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--primary-accent)]";

  return (
    <div className="flex flex-col gap-[24px] p-[40px] max-w-[1000px]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-[4px]">
          <h1 className="font-outfit text-[28px] font-bold text-[var(--text-primary)] tracking-[-1px]">Announcements</h1>
          <p className="font-inter text-[14px] text-[var(--text-secondary)]">Create and publish community announcements.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-[8px] px-[16px] py-[10px] rounded-[10px] bg-[var(--primary)] font-inter text-[13px] font-semibold text-white cursor-pointer hover:brightness-110 transition-all">
          <Plus size={16} /> New Announcement
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-[16px] p-[24px] rounded-[14px] bg-[var(--surface)] border border-[var(--border)]">
          <div className="flex items-center justify-between">
            <span className="font-outfit text-[16px] font-semibold text-[var(--text-primary)]">{editing ? "Edit" : "New Announcement"}</span>
            <button type="button" onClick={() => setPreview(!preview)} className="font-inter text-[12px] text-[var(--primary-accent)] cursor-pointer hover:underline">
              {preview ? "Edit" : "Preview"}
            </button>
          </div>
          {preview ? (
            <div className="p-[20px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)]">
              <h3 className="font-outfit text-[18px] font-semibold text-[var(--text-primary)] mb-[12px]">{form.title || "Untitled"}</h3>
              <div className="font-inter text-[14px] text-[var(--text-secondary)] leading-[1.7] whitespace-pre-wrap">{form.content}</div>
            </div>
          ) : (
            <>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className={inputClass} />
              <textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Content (supports markdown)" rows={8} className={`${inputClass} resize-none font-mono text-[12px]`} />
              <div className="flex items-center gap-[12px]">
                <label className="px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-secondary)] cursor-pointer hover:border-[var(--primary-accent)] transition-colors">
                  {uploading ? "Uploading..." : "Upload Cover Image"}
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                </label>
                {form.cover_image_url && <img src={form.cover_image_url} alt="" className="h-[32px] w-auto rounded-[4px]" />}
              </div>
            </>
          )}
          <div className="flex items-center gap-[12px]">
            <button type="submit" className="px-[20px] py-[10px] rounded-[8px] bg-[var(--primary)] font-inter text-[13px] font-semibold text-white cursor-pointer hover:brightness-110 transition-all">{editing ? "Save" : "Create"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-[20px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="font-inter text-[13px] text-[var(--text-muted)]">Loading...</p>
      ) : (
        <div className="flex flex-col gap-[8px]">
          {items.map((a) => (
            <div key={a.id} className="flex items-center gap-[16px] p-[16px] rounded-[10px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-light)] transition-colors">
              <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                <span className="font-inter text-[14px] font-medium text-[var(--text-primary)] truncate">{a.title}</span>
                <span className="font-inter text-[12px] text-[var(--text-muted)]">
                  {a.published_at ? new Date(a.published_at).toLocaleDateString("en-MY") : "Not published"}
                </span>
              </div>
              <span className={`px-[10px] py-[3px] rounded-full font-inter text-[11px] font-medium ${a.status === "published" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                {a.status}
              </span>
              <div className="flex items-center gap-[4px]">
                <button onClick={() => toggleStatus(a)} className="p-[8px] rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer" title={a.status === "published" ? "Unpublish" : "Publish"}>
                  {a.status === "published" ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => openEdit(a)} className="p-[8px] rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"><Pencil size={14} /></button>
                {role === "admin" && <button onClick={() => handleDelete(a.id)} className="p-[8px] rounded-[6px] text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"><Trash2 size={14} /></button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
