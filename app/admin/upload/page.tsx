"use client";
import { useEffect, useRef, useState } from "react";
import { Upload, Check, Loader2, Star, Trash2 } from "lucide-react";

type Cat = { _id: string; name: string };
type Staged = { id: string; file: File; preview: string; status: "ready"|"uploading"|"done"|"error"; title: string; categoryId: string; tags: string[]; featured: boolean; error?: string };

export default function UploadPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [staged, setStaged] = useState<Staged[]>([]);
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { fetch("/api/categories").then(r => r.json()).then(d => setCats(d.categories ?? [])); }, []);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).filter(f => f.type.startsWith("image/")).forEach(file => {
      const id = Math.random().toString(36).slice(2);
      const preview = URL.createObjectURL(file);
      setStaged(s => [...s, { id, file, preview, status: "ready", title: file.name.replace(/\.[^.]+$/, ""), categoryId: cats[0]?._id ?? "", tags: [], featured: false }]);
    });
  };

  const update = (id: string, patch: Partial<Staged>) => setStaged(s => s.map(x => x.id === id ? { ...x, ...patch } : x));
  const remove = (id: string) => setStaged(s => s.filter(x => x.id !== id));

  const uploadOne = async (s: Staged) => {
    update(s.id, { status: "uploading" });
    const fd = new FormData();
    fd.append("file", s.file);
    fd.append("meta", JSON.stringify({ title: s.title, categoryId: s.categoryId, tags: s.tags, featured: s.featured }));
    try {
      const res = await fetch("/api/admin/wallpapers", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Upload failed");
      update(s.id, { status: "done" });
    } catch (e: any) {
      update(s.id, { status: "error", error: String(e.message ?? e) });
    }
  };

  const uploadAll = () => staged.filter(s => s.status === "ready" && s.title && s.categoryId).forEach(uploadOne);

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold tracking-tight">Upload wallpapers</h1>
      <div onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onClick={() => ref.current?.click()}
        className={`rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition ${drag ? "border-violet-500 bg-violet-500/5" : "border-zinc-800 bg-zinc-950"}`}>
        <input ref={ref} type="file" multiple accept="image/*" hidden onChange={(e) => onFiles(e.target.files)} />
        <Upload className="w-10 h-10 mx-auto text-violet-300 mb-3" />
        <div className="text-lg font-semibold">Drop images or click to browse</div>
        <div className="text-xs text-zinc-500 mt-1">JPG, PNG, WebP Â· up to 25MB Â· auto-uploaded to Cloudinary CDN</div>
      </div>

      {staged.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div className="text-sm">{staged.length} pending Â· {staged.filter(s => s.status === "done").length} done</div>
            <button onClick={uploadAll} className="bg-white text-black text-xs font-medium px-4 py-2 rounded-lg hover:bg-zinc-200">Publish all</button>
          </div>
          <div className="space-y-3">
            {staged.map(s => (
              <div key={s.id} className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col lg:flex-row gap-4">
                <div className="w-full lg:w-40 h-28 rounded-lg overflow-hidden bg-zinc-900 relative flex-shrink-0">
                  <img src={s.preview} alt="" className="w-full h-full object-cover" />
                  {s.status === "done" && <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur flex items-center justify-center"><Check className="w-8 h-8 text-emerald-300" /></div>}
                  {s.status === "uploading" && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="w-6 h-6 text-violet-300 animate-spin" /></div>}
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Title</label>
                    <input value={s.title} onChange={(e) => update(s.id, { title: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Category</label>
                    <select value={s.categoryId} onChange={(e) => update(s.id, { categoryId: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none">
                      {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-zinc-400 mb-1">Tags (comma-separated)</label>
                    <input defaultValue={s.tags.join(", ")} onChange={(e) => update(s.id, { tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-zinc-400">
                    <input type="checkbox" checked={s.featured} onChange={(e) => update(s.id, { featured: e.target.checked })} className="accent-violet-500" />
                    <Star className="w-3.5 h-3.5" /> Feature on homepage
                  </label>
                  {s.error && <div className="text-xs text-red-400">{s.error}</div>}
                  <button onClick={() => remove(s.id)} className="ml-auto text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}