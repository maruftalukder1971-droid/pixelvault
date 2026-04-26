"use client";
import Link from "next/link";
import Image from "next/image";
import { Download, Heart, Maximize2 } from "lucide-react";
import { useEffect, useState } from "react";

const fmt = (n: number) => n >= 1e6 ? (n/1e6).toFixed(1) + "M" : n >= 1000 ? (n/1000).toFixed(1) + "K" : String(n ?? 0);

export default function WallpaperCard({ w }: { w: any }) {
  const cat = w.category;
  const [likes, setLikes] = useState<number>(w.likes ?? 0);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const set = new Set<string>(JSON.parse(localStorage.getItem("pv_likes") || "[]"));
      setLiked(set.has(w._id));
    } catch {}
  }, [w._id]);

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const action = liked ? "unlike" : "like";
    setLiked(!liked);
    setLikes((v) => Math.max(0, v + (liked ? -1 : 1)));
    try {
      const set = new Set<string>(JSON.parse(localStorage.getItem("pv_likes") || "[]"));
      if (liked) set.delete(w._id); else set.add(w._id);
      localStorage.setItem("pv_likes", JSON.stringify(Array.from(set)));
      const res = await fetch(`/api/wallpapers/${w._id}/like`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (typeof data.likes === "number") setLikes(data.likes);
    } catch {
      setLiked(liked);
      setLikes((v) => Math.max(0, v + (liked ? 1 : -1)));
    } finally { setBusy(false); }
  };

  const triggerDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = `/api/wallpapers/${w._id}/download?res=hd`;
    document.body.appendChild(iframe);
    setTimeout(() => document.body.removeChild(iframe), 3000);
  };

  return (
    <Link href={`/wallpaper/${w.slug}`}
      style={{ aspectRatio: `${w.width}/${w.height}` }}
      className="group hover-when-idle relative block w-full overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] transform-gpu ease-premium transition-colors duration-300 hover:border-white/[0.15]">
      <Image
        src={w.url}
        alt={w.title}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, (max-width: 1280px) 25vw, (max-width: 1600px) 40vw, 33vw"
        className="object-cover transform-gpu transition-transform duration-700 ease-premium group-hover:scale-110"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2318181b'/></svg>";
        }}
      />

      {/* Persistent gradient at bottom for stats */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/30 opacity-0 group-hover:opacity-100 ease-premium transition-opacity duration-300" />

      {/* Top-left: resolution chip */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        <div className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-md border border-white/[0.08] rounded-md text-[10px] font-bold tracking-wider text-white">
          {w.width >= 3840 ? <span className="gradient-text">4K</span> : w.width >= 2560 ? "QHD" : "HD"}
        </div>
      </div>

      {/* Top-right: like button */}
      <button onClick={toggleLike} disabled={busy} aria-label={liked ? "Unlike" : "Like"}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center ease-premium transition-all duration-300 active:scale-90 ${liked
          ? "bg-rose-500/90 border-rose-400 shadow-lg shadow-rose-500/30 scale-100"
          : "bg-black/40 border-white/10 hover:bg-black/60 opacity-0 group-hover:opacity-100"}`}>
        <Heart className={`w-4 h-4 ease-premium transition-all ${liked ? "text-white fill-white scale-110" : "text-white"}`} />
      </button>

      {/* Center: hover preview action */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 ease-premium transition-opacity duration-300 pointer-events-none">
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
          <Maximize2 className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute inset-x-0 bottom-0 p-3 z-10">
        <div className="text-sm font-semibold text-white truncate drop-shadow-lg mb-1.5">{w.title}</div>
        <div className="flex items-center gap-2 text-xs">
          {cat?.name && (
            <span className="flex items-center gap-1 text-zinc-300 truncate min-w-0">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color, boxShadow: `0 0 6px ${cat.color}` }} />
              <span className="truncate">{cat.name}</span>
            </span>
          )}
          <span className="ml-auto flex items-center gap-2.5 flex-shrink-0">
            <span className="flex items-center gap-1 text-white font-semibold">
              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-rose-400 text-rose-400" : ""}`} />
              {fmt(likes)}
            </span>
            <button onClick={triggerDownload}
              className="flex items-center gap-1 text-white font-semibold hover:text-violet-300 ease-premium transition-colors pointer-events-auto">
              <Download className="w-3.5 h-3.5" />
              {fmt(w.downloads)}
            </button>
          </span>
        </div>
      </div>
    </Link>
  );
}