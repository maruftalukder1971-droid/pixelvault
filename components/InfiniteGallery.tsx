"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import WallpaperCard from "./WallpaperCard";
import { Loader2 } from "lucide-react";

type Params = { category?: string; q?: string; minWidth?: number; maxWidth?: number; sort?: string; featured?: boolean; orientation?: string };

function useColumns() {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = window.innerWidth;
        if (w < 640) setCols(2);          // mobile: 2 cols
        else if (w < 1024) setCols(3);    // tablet: 3 cols
        else if (w < 1440) setCols(3);    // small desktop: 3 cols (bigger images!)
        else if (w < 1800) setCols(4);    // desktop: 4 cols
        else setCols(5);                  // ultrawide: 5 cols
      });
    };
    calc();
    window.addEventListener("resize", calc, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", calc); };
  }, []);
  return cols;
}

export default function InfiniteGallery({ params }: { params: Params }) {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const sentinel = useRef<HTMLDivElement>(null);
  const cols = useColumns();

  const reset = JSON.stringify(params);
  useEffect(() => { setItems([]); setPage(1); setHasMore(true); }, [reset]);

  const load = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), limit: "30" });
    if (params.category) qs.set("category", params.category);
    if (params.q) qs.set("q", params.q);
    if (params.minWidth) qs.set("minWidth", String(params.minWidth));
    if (params.maxWidth) qs.set("maxWidth", String(params.maxWidth));
    if (params.orientation) qs.set("orientation", params.orientation);
    if (params.sort) qs.set("sort", params.sort);
    if (params.featured) qs.set("featured", "1");
    const res = await fetch("/api/wallpapers?" + qs.toString());
    const data = await res.json();
    setItems(prev => [...prev, ...(data.items ?? [])]);
    setHasMore(data.hasMore);
    setTotal(data.total);
    setPage(p => p + 1);
    setLoading(false);
  }, [page, hasMore, loading, params]);

  useEffect(() => {
    if (!sentinel.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) load(); }, { rootMargin: "1500px" });
    obs.observe(sentinel.current);
    return () => obs.disconnect();
  }, [load]);

  // Distribute items into columns based on aspect ratio (shortest column wins)
  const columns = useMemo(() => {
    const buckets: { items: any[]; height: number }[] = Array.from({ length: cols }, () => ({ items: [], height: 0 }));
    for (const item of items) {
      const ratio = (item.height || 1) / (item.width || 1);
      let shortest = 0;
      for (let i = 1; i < buckets.length; i++) if (buckets[i].height < buckets[shortest].height) shortest = i;
      buckets[shortest].items.push(item);
      buckets[shortest].height += ratio;
    }
    return buckets;
  }, [items, cols]);

  return (
    <div>
      {total > 0 && (
        <div className="text-xs text-zinc-500 mb-4 px-1">{total.toLocaleString()} wallpapers</div>
      )}

      <div className="flex gap-3" style={{ contain: "layout paint" }}>
        {columns.map((col, i) => (
          <div key={i} className="flex-1 min-w-0 flex flex-col gap-3" style={{ contain: "layout" }}>
            {col.items.map((w) => (
              <WallpaperCard key={w._id} w={w} />
            ))}
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex gap-3 mt-3">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="flex-1 flex flex-col gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="skeleton rounded-2xl w-full" style={{ aspectRatio: i % 2 === 0 ? "3/4" : "4/3" }} />
              ))}
            </div>
          ))}
        </div>
      )}

      <div ref={sentinel} className="h-10 flex items-center justify-center mt-8">
        {loading && <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />}
        {!hasMore && items.length > 0 && (
          <div className="text-xs text-zinc-500">You have reached the end - {total.toLocaleString()} total</div>
        )}
        {!loading && items.length === 0 && (
          <div className="text-center py-16">
            <div className="text-zinc-400 dark:text-zinc-600 text-sm">No wallpapers found</div>
            <div className="text-zinc-300 dark:text-zinc-700 text-xs mt-1">Try a different search</div>
          </div>
        )}
      </div>
    </div>
  );
}