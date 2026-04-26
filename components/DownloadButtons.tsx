"use client";
import { useState, useEffect } from "react";
import { Download, Smartphone, Monitor, Tv, Loader2, Image as ImageIcon, Heart } from "lucide-react";

const SIZES = [
  { res: "mobile", label: "Mobile", sub: "1080x1920", icon: Smartphone, minWidth: 1080 },
  { res: "hd", label: "HD", sub: "1920x1080", icon: Monitor, minWidth: 1920 },
  { res: "qhd", label: "QHD", sub: "2560x1440", icon: Monitor, minWidth: 2560 },
  { res: "4k", label: "4K UHD", sub: "3840x2160", icon: Tv, minWidth: 3840 }
];

const fmt = (n: number) => n >= 1e6 ? (n/1e6).toFixed(1) + "M" : n >= 1000 ? (n/1000).toFixed(1) + "K" : String(n ?? 0);

export default function DownloadButtons({ id, maxWidth, initialLikes = 0, initialDownloads = 0 }: { id: string; maxWidth: number; initialLikes?: number; initialDownloads?: number }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const set = new Set<string>(JSON.parse(localStorage.getItem("pv_likes") || "[]"));
      setLiked(set.has(id));
    } catch {}
  }, [id]);

  const toggleLike = async () => {
    if (busy) return;
    setBusy(true);
    const action = liked ? "unlike" : "like";
    setLiked(!liked);
    setLikes((v) => Math.max(0, v + (liked ? -1 : 1)));
    try {
      const set = new Set<string>(JSON.parse(localStorage.getItem("pv_likes") || "[]"));
      if (liked) set.delete(id); else set.add(id);
      localStorage.setItem("pv_likes", JSON.stringify(Array.from(set)));
      const res = await fetch(`/api/wallpapers/${id}/like`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (typeof data.likes === "number") setLikes(data.likes);
    } finally { setBusy(false); }
  };

  const trigger = async (res: string) => {
    if (loading) return;
    setLoading(res);
    setProgress(0);

    try {
      // Step 1: hit our API to log the download and get redirected to Cloudinary URL
      // We use { redirect: "follow" } so fetch automatically follows the 302 to Cloudinary
      const response = await fetch(`/api/wallpapers/${id}/download?res=${res}`, { redirect: "follow" });
      if (!response.ok) throw new Error(`Download failed (${response.status})`);

      // Step 2: stream the response with progress tracking
      const total = Number(response.headers.get("content-length")) || 0;
      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            received += value.length;
            if (total > 0) setProgress(Math.round((received / total) * 100));
          }
        }
      }

      // Step 3: build a blob and trigger save dialog
      const contentType = response.headers.get("content-type") ?? "image/jpeg";
      const blob = new Blob(chunks as BlobPart[], { type: contentType });
      const url = URL.createObjectURL(blob);

      // Try to read filename from Content-Disposition (Cloudinary fl_attachment sets this)
      let filename = `wallpaper-${res}.jpg`;
      const cd = response.headers.get("content-disposition");
      if (cd) {
        const match = cd.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i);
        if (match && match[1]) filename = decodeURIComponent(match[1]);
      } else {
        // Infer extension from MIME
        const ext = contentType.split("/")[1]?.split(";")[0] || "jpg";
        filename = `wallpaper-${res}.${ext}`;
      }

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Cleanup blob URL after a moment so the download has time to start
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Download error:", err);
      // Last-resort fallback: open in new tab
      window.open(`/api/wallpapers/${id}/download?res=${res}`, "_blank");
    } finally {
      setLoading(null);
      setProgress(0);
    }
  };

  return (
    <div className="mt-5">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={toggleLike} disabled={busy}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 active:scale-95 ${liked
            ? "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30"
            : "bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          }`}>
          <Heart className={`w-4 h-4 ${liked ? "fill-white" : ""}`} />
          {fmt(likes)}
        </button>
        <div className="flex items-center gap-1 px-3 py-2 text-sm text-zinc-500">
          <Download className="w-4 h-4" />
          {fmt(initialDownloads)} downloads
        </div>
      </div>

      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">Download size</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SIZES.map(s => {
          const available = maxWidth >= s.minWidth;
          const isLoading = loading === s.res;
          return (
            <button key={s.res} onClick={() => available && trigger(s.res)} disabled={!available || !!loading}
              className={`relative p-3 rounded-xl border text-left transition overflow-hidden ${available
                ? "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-violet-500/50 hover:bg-violet-50 dark:hover:bg-zinc-900 hover:shadow"
                : "bg-zinc-50 dark:bg-zinc-950/50 border-zinc-100 dark:border-zinc-900 opacity-40 cursor-not-allowed"} ${isLoading ? "ring-2 ring-violet-500/40" : ""}`}>
              {isLoading && progress > 0 && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-violet-500 transition-all" style={{ width: `${progress}%` }} />
              )}
              <div className="flex items-center justify-between mb-1.5">
                <s.icon className="w-4 h-4 text-zinc-500" />
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" /> : <Download className="w-3.5 h-3.5 text-zinc-400" />}
              </div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{s.label}</div>
              <div className="text-[11px] text-zinc-500 font-mono">{s.sub}</div>
            </button>
          );
        })}
      </div>

      <button onClick={() => trigger("original")} disabled={!!loading}
        className="relative mt-2 w-full p-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-semibold shadow hover:shadow-lg transition disabled:opacity-60 flex items-center justify-center gap-2 overflow-hidden">
        {loading === "original" && progress > 0 && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/40" style={{ width: `${progress}%` }} />
        )}
        {loading === "original" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
        {loading === "original" ? `Downloading... ${progress}%` : `Download Original (${maxWidth}px, full quality)`}
      </button>
    </div>
  );
}