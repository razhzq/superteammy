import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useProjects, createProject, updateProject, deleteProject, uploadFile } from "../../hooks/useCms";
import type { Project } from "../../lib/database.types";
import { useAuth } from "../../context/AuthContext";

type FormData = Omit<Project, "id" | "created_at">;
const EMPTY: FormData = { name: "", description: "", logo_url: null, project_url: null };

export default function ProjectsPage() {
  const { data: projects, loading, refetch } = useProjects();
  const { role } = useAuth();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `projects/${Date.now()}-${file.name}`;
    const { url } = await uploadFile("media", path, file);
    if (url) setForm({ ...form, logo_url: url });
    setUploading(false);
  }

  function openCreate() { setEditing(null); setForm(EMPTY); setShowForm(true); }
  function openEdit(p: Project) { setEditing(p.id); setForm({ name: p.name, description: p.description, logo_url: p.logo_url, project_url: p.project_url }); setShowForm(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) await updateProject(editing, form);
    else await createProject(form);
    setShowForm(false);
    refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    await deleteProject(id);
    refetch();
  }

  const inputClass = "px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--primary-accent)]";

  return (
    <div className="flex flex-col gap-[24px] p-[40px] max-w-[1000px]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-[4px]">
          <h1 className="font-outfit text-[28px] font-bold text-[var(--text-primary)] tracking-[-1px]">Projects</h1>
          <p className="font-inter text-[14px] text-[var(--text-secondary)]">Manage ecosystem projects.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-[8px] px-[16px] py-[10px] rounded-[10px] bg-[var(--primary)] font-inter text-[13px] font-semibold text-white cursor-pointer hover:brightness-110 transition-all">
          <Plus size={16} /> Add Project
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-[16px] p-[24px] rounded-[14px] bg-[var(--surface)] border border-[var(--border)]">
          <span className="font-outfit text-[16px] font-semibold text-[var(--text-primary)]">{editing ? "Edit Project" : "New Project"}</span>
          <div className="grid grid-cols-2 gap-[12px]">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Project name" className={inputClass} />
            <input value={form.project_url ?? ""} onChange={(e) => setForm({ ...form, project_url: e.target.value || null })} placeholder="Project URL (optional)" className={inputClass} />
          </div>
          <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className={`${inputClass} resize-none`} />
          <div className="flex items-center gap-[12px]">
            <label className="px-[14px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-secondary)] cursor-pointer hover:border-[var(--primary-accent)] transition-colors">
              {uploading ? "Uploading..." : "Upload Logo"}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            {form.logo_url && <img src={form.logo_url} alt="" className="h-[28px] w-auto rounded-[4px]" />}
          </div>
          <div className="flex items-center gap-[12px]">
            <button type="submit" className="px-[20px] py-[10px] rounded-[8px] bg-[var(--primary)] font-inter text-[13px] font-semibold text-white cursor-pointer hover:brightness-110 transition-all">{editing ? "Save" : "Add Project"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-[20px] py-[10px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--border)] font-inter text-[13px] text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="font-inter text-[13px] text-[var(--text-muted)]">Loading...</p>
      ) : (
        <div className="flex flex-col gap-[8px]">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center gap-[16px] p-[16px] rounded-[10px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-light)] transition-colors">
              <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                <span className="font-inter text-[14px] font-medium text-[var(--text-primary)] truncate">{p.name}</span>
                <span className="font-inter text-[12px] text-[var(--text-secondary)] truncate">{p.description}</span>
              </div>
              <div className="flex items-center gap-[4px]">
                <button onClick={() => openEdit(p)} className="p-[8px] rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"><Pencil size={14} /></button>
                {role === "admin" && <button onClick={() => handleDelete(p.id)} className="p-[8px] rounded-[6px] text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"><Trash2 size={14} /></button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
