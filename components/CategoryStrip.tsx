"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Image as ImageIcon, ChevronDown, Grid3x3 } from "lucide-react";

type Cat = { _id: string; name: string; slug: string; color: string; count: number };

function useColumns() {
  const [cols, setCols] = useState(8);
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = window.innerWidth;
        if (w < 640) setCols(3);
        else if (w < 768) setCols(4);
        else if (w < 1024) setCols(6);
        else if (w < 1280) setCols(8);
        else if (w < 1600) setCols(10);
        else setCols(12);
      });
    };
    calc();
    window.addEventListener("resize", calc, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", calc); };
  }, []);
  return cols;
}

export default function CategoryStrip({ cats }: { cats: Cat[] }) {
  const [expanded, setExpanded] = useState(false);
  const cols = useColumns();
  const VISIBLE_ROWS = 2;
  const visibleCount = cols * VISIBLE_ROWS;

  const sorted = [...cats].sort((a, b) => b.count - a.count);
  const visible = expanded ? sorted : sorted.slice(0, visibleCount);
  const hiddenCount = Math.max(0, sorted.length - visibleCount);

  return (
    <section className="w-full px-3 sm:px-4 lg:px-6 py-12 border-b border-white/[0.06]">
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Grid3x3 className="w-4 h-4 text-zinc-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Browse by category</h2>
            <p className="text-xs text-zinc-500">{cats.length} curated collections</p>
          </div>
        </div>
      </div>

      <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {visible.map((c) => (
          <Link key={c._id} href={`/category/${c.slug}`}
            className="group relative overflow-hidden rounded-2xl px-3 py-4 ease-premium transition-all duration-300 hover:scale-[1.04] active:scale-95 border border-white/[0.06] hover:border-white/[0.15]"
            style={{ background: `linear-gradient(135deg, ${c.color}18, ${c.color}06)` }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 ease-premium transition-opacity duration-500"
              style={{ background: `radial-gradient(ellipse at top, ${c.color}30, transparent 70%)` }} />
            <div className="relative">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2 ease-premium transition-transform duration-300 group-hover:scale-110"
                style={{ background: c.color + "30", boxShadow: `0 0 16px ${c.color}40` }}>
                <ImageIcon className="w-3.5 h-3.5" style={{ color: c.color }} />
              </div>
              <div className="text-xs font-semibold text-white truncate">{c.name}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                {c.count.toLocaleString()}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hiddenCount > 0 && (
        <div className="flex justify-center mt-6">
          <button onClick={() => setExpanded(e => !e)}
            className="group flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-zinc-300 hover:text-white ease-premium transition-all duration-300">
            <span>{expanded ? "Show less" : `Show ${hiddenCount} more categories`}</span>
            <ChevronDown className={`w-4 h-4 ease-premium transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </section>
  );
}