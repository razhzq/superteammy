import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useEvents, createEvent, updateEvent, deleteEvent, uploadFile } from "../../hooks/useCms";
import type { Event, ContentStatus } from "../../lib/database.types";
import { useAuth } from "../../context/AuthContext";

type FormData = Omit<Event, "id" | "created_at" | "updated_at">;

const EMPTY_FORM: FormData = {
  title: "",
  description: "",
  event_date: "",
  location: "",
  image_url: null,
  registration_link: null,
  status: "draft",
};

export default function EventsPage() {
  const { data: events, loading, refetch } = useEvents();
  const { role } = useAuth();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `events/${Date.now()}-${file.name}`;
    const { url } = await uploadFile("media", path, file);
    if (url) setForm({ ...form, image_url: url });
    setUploading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(event: Event) {
    setEditing(event.id);
    setForm({
      title: event.title,
      description: event.description,
      event_date: event.event_date.slice(0, 16),
      location: event.location,
      image_url: event.image_url,
      registration_link: event.registration_link,
      status: event.status,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await updateEvent(editing, form);
    } else {
      await createEvent(form);
    }
    setShowForm(false);
    refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    await deleteEvent(id);
    refetch();
  }

  async function toggleStatus(event: Event) {
    const next: ContentStatus = event.status === "published" ? "draft" : "published";
    await updateEvent(event.id, { status: next });
    refetch();
  }

  return (
    <div className="flex flex-col gap-[24px] p-[40px] max-w-[1000px]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-[4px]">
          <h1 className="font-outfit text-[28px] font-bold text-[var(--text-primary)] tracking-[-1px]">
            Events
          </h1>
          <p className="font-inter text-[14px] text-[var(--text-secondary)]">
            Manage community events and hackathons.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-[8px] px-[16px] py-[10px] rounded-[10px] bg-[var(--primary)] font-inter text-[13px] font-semibold text-white cursor-pointer hover:brightness-110 transition-all"
        >
          <Plus size={16} />
          Add Event
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-[16px] p-[24px] rounded-[14px] bg-[var(--surface)] border border-[var(--border)]"
        >
          <span className="font-outfit text-[16px] font-semibold text-[var(--text-primary)]">
            {editing ? "Edit Event" : "New Event"}
          </span>
          <div className="grid grid-cols-2 gap-[12px]">
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title"
              className="px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--primary-accent)]"
            />
            <input
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Location"
              className="px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--primary-accent)]"
            />
            <input
              required
              type="datetime-local"
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              className="px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--primary-accent)]"
            />
            <input
              value={form.registration_link ?? ""}
              onChange={(e) => setForm({ ...form, registration_link: e.target.value || null })}
              placeholder="Registration link (optional)"
              className="px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--primary-accent)]"
            />
          </div>
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            rows={3}
            className="px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--primary-accent)] resize-none"
          />
          <div className="flex items-center gap-[12px]">
            <label className="px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-secondary)] cursor-pointer hover:border-[var(--primary-accent)] transition-colors">
              {uploading ? "Uploading..." : "Upload Banner"}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {form.image_url && <img src={form.image_url} alt="" className="h-[32px] w-auto rounded-[4px]" />}
          </div>
          <div className="flex items-center gap-[12px]">
            <button
              type="submit"
              className="px-[20px] py-[10px] rounded-[8px] bg-[var(--primary)] font-inter text-[13px] font-semibold text-white cursor-pointer hover:brightness-110 transition-all"
            >
              {editing ? "Save Changes" : "Create Event"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-[20px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Events List */}
      {loading ? (
        <p className="font-inter text-[13px] text-[var(--text-muted)]">Loading...</p>
      ) : events.length === 0 ? (
        <p className="font-inter text-[13px] text-[var(--text-muted)]">No events yet.</p>
      ) : (
        <div className="flex flex-col gap-[8px]">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-[16px] p-[16px] rounded-[10px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-light)] transition-colors"
            >
              <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                <span className="font-inter text-[14px] font-medium text-[var(--text-primary)] truncate">
                  {event.title}
                </span>
                <span className="font-inter text-[12px] text-[var(--text-secondary)]">
                  {event.location} ·{" "}
                  {new Date(event.event_date).toLocaleDateString("en-MY", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <span
                className={`px-[10px] py-[3px] rounded-full font-inter text-[11px] font-medium ${
                  event.status === "published"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-yellow-500/10 text-yellow-400"
                }`}
              >
                {event.status}
              </span>
              <div className="flex items-center gap-[4px]">
                <button
                  onClick={() => toggleStatus(event)}
                  className="p-[8px] rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"
                  title={event.status === "published" ? "Unpublish" : "Publish"}
                >
                  {event.status === "published" ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => openEdit(event)}
                  className="p-[8px] rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"
                >
                  <Pencil size={14} />
                </button>
                {role === "admin" && (
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-[8px] rounded-[6px] text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
