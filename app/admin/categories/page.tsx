"use client";
import { useEffect, useState } from "react";
import { Folder, Plus, Trash2 } from "lucide-react";

export default function CategoriesAdmin() {
  const [cats, setCats] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#a78bfa");
  const colors = ["#a78bfa","#10b981","#ec4899","#ef4444","#3b82f6","#f59e0b","#06b6d4","#d946ef"];

  const load = () => fetch("/api/categories").then(r => r.json()).then(d => setCats(d.categories ?? []));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), color }) });
    setName(""); setAdding(false); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); alert(d.error); return; }
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Categories</h1>
        <button onClick={() => setAdding(true)} className="bg-white text-black text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Add</button>
      </div>
      {adding && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 space-y-3">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-2">{colors.map(c => <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded ${color===c?"ring-2 ring-white":""}`} style={{ background: c }} />)}</div>
          <div className="flex gap-2"><button onClick={add} className="bg-white text-black text-sm px-3 py-1.5 rounded">Save</button><button onClick={() => setAdding(false)} className="text-sm text-zinc-400 px-3 py-1.5">Cancel</button></div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {cats.map(c => (
          <div key={c._id} className="group bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: c.color + "20", border: `1px solid ${c.color}40` }}><Folder className="w-4 h-4" style={{ color: c.color }} /></div>
            <div className="flex-1">
              <div className="text-sm font-medium">{c.name}</div>
              <div className="text-xs text-zinc-500">{c.count ?? 0} wallpapers Â· /{c.slug}</div>
            </div>
            <button onClick={() => del(c._id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-950/30 hover:text-red-400 rounded transition"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}