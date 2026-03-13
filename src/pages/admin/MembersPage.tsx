import { useState } from "react";
import { Plus, Pencil, Trash2, Star, StarOff } from "lucide-react";
import { useMembers, createMember, updateMember, deleteMember, uploadFile } from "../../hooks/useCms";
import type { Member } from "../../lib/database.types";
import { useAuth } from "../../context/AuthContext";

type FormData = Omit<Member, "id" | "created_at">;

const EMPTY_FORM: FormData = {
  name: "",
  role: "",
  company: "",
  bio: null,
  avatar_url: null,
  skills: [],
  twitter_url: null,
  is_featured: false,
};

export default function MembersPage() {
  const { data: members, loading, refetch } = useMembers();
  const { role: userRole } = useAuth();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [skillInput, setSkillInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `members/${Date.now()}-${file.name}`;
    const { url } = await uploadFile("media", path, file);
    if (url) setForm({ ...form, avatar_url: url });
    setUploading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSkillInput("");
    setShowForm(true);
  }

  function openEdit(member: Member) {
    setEditing(member.id);
    setForm({
      name: member.name,
      role: member.role,
      company: member.company,
      bio: member.bio,
      avatar_url: member.avatar_url,
      skills: member.skills,
      twitter_url: member.twitter_url,
      is_featured: member.is_featured,
    });
    setSkillInput(member.skills.join(", "));
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      ...form,
      skills: skillInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    if (editing) {
      await updateMember(editing, data);
    } else {
      await createMember(data);
    }
    setShowForm(false);
    refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this member?")) return;
    await deleteMember(id);
    refetch();
  }

  async function toggleFeatured(member: Member) {
    await updateMember(member.id, { is_featured: !member.is_featured });
    refetch();
  }

  return (
    <div className="flex flex-col gap-[24px] p-[40px] max-w-[1000px]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-[4px]">
          <h1 className="font-outfit text-[28px] font-bold text-[var(--text-primary)] tracking-[-1px]">
            Members
          </h1>
          <p className="font-inter text-[14px] text-[var(--text-secondary)]">
            Manage builder profiles and featured members.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-[8px] px-[16px] py-[10px] rounded-[10px] bg-[var(--primary)] font-inter text-[13px] font-semibold text-white cursor-pointer hover:brightness-110 transition-all"
        >
          <Plus size={16} />
          Add Member
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-[16px] p-[24px] rounded-[14px] bg-[var(--surface)] border border-[var(--border)]"
        >
          <span className="font-outfit text-[16px] font-semibold text-[var(--text-primary)]">
            {editing ? "Edit Member" : "New Member"}
          </span>
          <div className="grid grid-cols-2 gap-[12px]">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--primary-accent)]"
            />
            <input
              required
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Role"
              className="px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--primary-accent)]"
            />
            <input
              required
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Company"
              className="px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--primary-accent)]"
            />
            <input
              value={form.twitter_url ?? ""}
              onChange={(e) => setForm({ ...form, twitter_url: e.target.value || null })}
              placeholder="Twitter URL (optional)"
              className="px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--primary-accent)]"
            />
          </div>
          <div className="flex items-center gap-[12px]">
            <label className="px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-secondary)] cursor-pointer hover:border-[var(--primary-accent)] transition-colors">
              {uploading ? "Uploading..." : "Upload Avatar"}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
            {form.avatar_url && <img src={form.avatar_url} alt="" className="h-[36px] w-[36px] rounded-full object-cover" />}
          </div>
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Skills (comma-separated)"
            className="px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--primary-accent)]"
          />
          <textarea
            value={form.bio ?? ""}
            onChange={(e) => setForm({ ...form, bio: e.target.value || null })}
            placeholder="Bio (optional)"
            rows={2}
            className="px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--primary-accent)] resize-none"
          />
          <div className="flex items-center gap-[12px]">
            <button
              type="submit"
              className="px-[20px] py-[10px] rounded-[8px] bg-[var(--primary)] font-inter text-[13px] font-semibold text-white cursor-pointer hover:brightness-110 transition-all"
            >
              {editing ? "Save Changes" : "Add Member"}
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

      {loading ? (
        <p className="font-inter text-[13px] text-[var(--text-muted)]">Loading...</p>
      ) : members.length === 0 ? (
        <p className="font-inter text-[13px] text-[var(--text-muted)]">No members yet.</p>
      ) : (
        <div className="flex flex-col gap-[8px]">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-[16px] p-[16px] rounded-[10px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-light)] transition-colors"
            >
              <div
                className="w-[36px] h-[36px] shrink-0 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]"
              />
              <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                <span className="font-inter text-[14px] font-medium text-[var(--text-primary)] truncate">
                  {member.name}
                </span>
                <span className="font-inter text-[12px] text-[var(--text-secondary)]">
                  {member.role} · {member.company}
                </span>
              </div>
              <div className="flex items-center gap-[6px] flex-wrap">
                {member.skills.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="px-[8px] py-[2px] rounded-full bg-[var(--primary-8)] font-inter text-[10px] text-[var(--primary-accent)]"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-[4px]">
                <button
                  onClick={() => toggleFeatured(member)}
                  className={`p-[8px] rounded-[6px] transition-colors cursor-pointer ${
                    member.is_featured
                      ? "text-[var(--secondary)] hover:bg-[var(--secondary-8)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]"
                  }`}
                  title={member.is_featured ? "Remove spotlight" : "Set spotlight"}
                >
                  {member.is_featured ? <Star size={14} /> : <StarOff size={14} />}
                </button>
                <button
                  onClick={() => openEdit(member)}
                  className="p-[8px] rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"
                >
                  <Pencil size={14} />
                </button>
                {userRole === "admin" && (
                  <button
                    onClick={() => handleDelete(member.id)}
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
