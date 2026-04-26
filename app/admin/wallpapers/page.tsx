"use client";
import { useEffect, useState } from "react";
import { Search, Trash2, Edit3, Loader2, X, Save, Star } from "lucide-react";

const fmt = (n: number) => n >= 1e3 ? (n/1e3).toFixed(1)+"K" : String(n);

export default function ManageWallpapers() {
  const [items, setItems] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/admin/wallpapers?limit=100").then(r => r.json());
    setItems(r.items);
    setLoading(false);
  };
  useEffect(() => { load(); fetch("/api/categories").then(r => r.json()).then(d => setCats(d.categories)); }, []);

  const filtered = items.filter(i =>
    !q ? true : i.title.toLowerCase().includes(q.toLowerCase()) || i.tags.some((t: string) => t.includes(q.toLowerCase()))
  );

  const del = async (id: string) => {
    if (!confirm("Delete this wallpaper? This is permanent.")) return;
    await fetch(`/api/admin/wallpapers/${id}`, { method: "DELETE" });
    setItems(items.filter(i => i._id !== id));
  };

  const save = async (patch: any) => {
    const res = await fetch(`/api/admin/wallpapers/${editing._id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...patch, category: patch.categoryId })
    });
    const data = await res.json();
    if (res.ok) {
      setItems(items.map(i => i._id === editing._id ? data.wallpaper : i));
      setEditing(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Wallpapers</h1>
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 rounded-lg px-3">
          <Search className="w-4 h-4 text-zinc-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Searchâ€¦" className="bg-transparent py-2 text-sm focus:outline-none w-48" />
        </div>
      </div>
      {loading ? <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-600" /></div> : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(w => (
            <div key={w._id} className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900">
              <img src={w.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition" />
              {w.featured && <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"><Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" /> Featured</div>}
              <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition">
                <div className="text-xs font-medium truncate">{w.title}</div>
                <div className="text-[10px] text-zinc-400">{w.width}Ã—{w.height} Â· {fmt(w.downloads)} dl</div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-1">
                <button onClick={() => setEditing({ ...w, categoryId: w.category?._id })} className="w-7 h-7 rounded bg-black/60 backdrop-blur flex items-center justify-center"><Edit3 className="w-3.5 h-3.5" /></button>
                <button onClick={() => del(w._id)} className="w-7 h-7 rounded bg-black/60 backdrop-blur hover:bg-red-500/40 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Edit wallpaper</h2>
              <button onClick={() => setEditing(null)}><X className="w-4 h-4" /></button>
            </div>
            <img src={editing.url} className="w-full aspect-video object-cover rounded-lg mb-4" alt="" />
            <div className="space-y-3">
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm" />
              <select value={editing.categoryId} onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm">
                {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <input value={editing.tags.join(", ")} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean) })} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="accent-violet-500" /> Featured</label>
              <button onClick={() => save({ title: editing.title, categoryId: editing.categoryId, tags: editing.tags, featured: editing.featured })}
                className="w-full bg-white text-black rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2"><Save className="w-3.5 h-3.5" /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}