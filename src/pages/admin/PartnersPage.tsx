import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { usePartners, createPartner, updatePartner, deletePartner, uploadFile } from "../../hooks/useCms";
import type { Partner } from "../../lib/database.types";
import { useAuth } from "../../context/AuthContext";

type FormData = Omit<Partner, "id" | "created_at">;

const EMPTY_FORM: FormData = { name: "", logo_url: "", website_url: null };

export default function PartnersPage() {
  const { data: partners, loading, refetch } = usePartners();
  const { role } = useAuth();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }
  function openEdit(p: Partner) {
    setEditing(p.id);
    setForm({ name: p.name, logo_url: p.logo_url, website_url: p.website_url });
    setShowForm(true);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `partners/${Date.now()}-${file.name}`;
    const { url } = await uploadFile("media", path, file);
    if (url) setForm({ ...form, logo_url: url });
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) { await updatePartner(editing, form); }
    else { await createPartner(form); }
    setShowForm(false);
    refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this partner?")) return;
    await deletePartner(id);
    refetch();
  }

  return (
    <div className="flex flex-col gap-[24px] p-[40px] max-w-[1000px]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-[4px]">
          <h1 className="font-outfit text-[28px] font-bold text-[var(--text-primary)] tracking-[-1px]">Partners</h1>
          <p className="font-inter text-[14px] text-[var(--text-secondary)]">Manage ecosystem partners and logos.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-[8px] px-[16px] py-[10px] rounded-[10px] bg-[var(--primary)] font-inter text-[13px] font-semibold text-white cursor-pointer hover:brightness-110 transition-all">
          <Plus size={16} /> Add Partner
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-[16px] p-[24px] rounded-[14px] bg-[var(--surface)] border border-[var(--border)]">
          <span className="font-outfit text-[16px] font-semibold text-[var(--text-primary)]">{editing ? "Edit Partner" : "New Partner"}</span>
          <div className="grid grid-cols-2 gap-[12px]">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Partner name" className="px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--primary-accent)]" />
            <input value={form.website_url ?? ""} onChange={(e) => setForm({ ...form, website_url: e.target.value || null })} placeholder="Website URL (optional)" className="px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--primary-accent)]" />
          </div>
          <div className="flex items-center gap-[12px]">
            <label className="px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-secondary)] cursor-pointer hover:border-[var(--primary-accent)] transition-colors">
              {uploading ? "Uploading..." : "Upload Logo"}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            {form.logo_url && <img src={form.logo_url} alt="" className="h-[32px] w-auto rounded-[4px]" />}
          </div>
          <div className="flex items-center gap-[12px]">
            <button type="submit" className="px-[20px] py-[10px] rounded-[8px] bg-[var(--primary)] font-inter text-[13px] font-semibold text-white cursor-pointer hover:brightness-110 transition-all">{editing ? "Save" : "Add Partner"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-[20px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="font-inter text-[13px] text-[var(--text-muted)]">Loading...</p>
      ) : (
        <div className="grid grid-cols-3 gap-[12px]">
          {partners.map((p) => (
            <div key={p.id} className="flex items-center gap-[14px] p-[16px] rounded-[12px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-light)] transition-colors">
              {p.logo_url && <img src={p.logo_url} alt={p.name} className="h-[28px] w-auto object-contain" />}
              <span className="font-inter text-[14px] font-medium text-[var(--text-primary)] flex-1 truncate">{p.name}</span>
              <div className="flex items-center gap-[2px]">
                <button onClick={() => openEdit(p)} className="p-[6px] rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"><Pencil size={13} /></button>
                {role === "admin" && <button onClick={() => handleDelete(p.id)} className="p-[6px] rounded-[6px] text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"><Trash2 size={13} /></button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
