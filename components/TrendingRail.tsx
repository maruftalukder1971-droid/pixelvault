"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

const fmt = (n: number) => n >= 1000 ? (n/1000).toFixed(1) + "K" : String(n ?? 0);

export default function TrendingRail({ items }: { items: any[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 400, behavior: "smooth" });

  return (
    <div className="relative group/rail">
      <button onClick={() => scroll(-1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/70 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/rail:opacity-100 hover:bg-black/90 ease-premium transition-all duration-300 -translate-x-2 group-hover/rail:translate-x-0">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => scroll(1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/70 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/rail:opacity-100 hover:bg-black/90 ease-premium transition-all duration-300 translate-x-2 group-hover/rail:translate-x-0">
        <ChevronRight className="w-5 h-5" />
      </button>

      <div ref={ref} className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 scroll-smooth">
        {items.map((w, i) => (
          <Link key={w._id} href={`/wallpaper/${w.slug}`}
            className="group relative flex-shrink-0 w-64 sm:w-72 lg:w-80 aspect-[3/4] rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] snap-start ease-premium transition-all duration-500 hover:border-white/[0.18] hover:shadow-[0_24px_60px_-20px_rgba(167,139,250,0.5)]">
            <div className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full bg-black/70 backdrop-blur-xl border border-white/10 flex items-center justify-center text-xs font-bold text-white">
              {i + 1}
            </div>
            <Image
              src={w.url}
              alt={w.title}
              fill
              sizes="320px"
              className="object-cover transform-gpu ease-premium transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 z-10">
              <div className="text-sm font-semibold text-white truncate drop-shadow mb-1">{w.title}</div>
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                {w.category?.name && (
                  <span className="flex items-center gap-1 truncate">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: w.category.color, boxShadow: `0 0 6px ${w.category.color}` }} />
                    {w.category.name}
                  </span>
                )}
                <span className="ml-auto flex items-center gap-2.5 flex-shrink-0 font-semibold text-white">
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {fmt(w.likes ?? 0)}</span>
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {fmt(w.downloads)}</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}