"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";

const HOT = ["nature", "anime", "cars", "space", "abstract", "cyberpunk"];

export default function HeroSearch() {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const submit = () => { if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`); };

  return (
    <>
      {/* === Search bar === */}
      <div className="relative group">
        {/* Animated glow ring */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 ease-premium pointer-events-none" />
        {/* Glass container */}
<div className="relative flex items-center gap-2 bg-white/[0.06] backdrop-blur-md border border-white/[0.1] group-hover:border-white/[0.18] group-focus-within:border-transparent rounded-2xl pl-5 pr-2 py-1.5 transition-colors duration-200 ease-premium">
          <Search className={`w-5 h-5 flex-shrink-0 transition-colors duration-300 ease-premium ${focused ? "text-violet-300" : "text-zinc-400"}`} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Search 4K, anime, cars, nature..."
            className="flex-1 bg-transparent py-3 text-base focus:outline-none placeholder:text-zinc-500 text-white min-w-0"
          />
          <button
            onClick={submit}
            disabled={!q.trim()}
            className="group/btn relative flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl overflow-hidden hover:bg-zinc-100 active:scale-[0.97] transition-all duration-200 ease-premium disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-lg">
            <span className="relative z-10 flex items-center gap-1.5">
              <span className="hidden sm:inline">Search</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform duration-200 ease-premium" />
            </span>
          </button>
        </div>
      </div>

      {/* === Popular tags === */}
      <div className="flex items-center gap-2 mt-5 flex-wrap justify-center">
        <span className="text-xs text-zinc-500 mr-1">Popular:</span>
{HOT.map((tag) => (
          <button
            key={tag}
            onClick={() => router.push(`/search?q=${tag}`)}
            className="text-xs text-zinc-300 hover:text-white px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.18] transition-colors duration-200 ease-premium hover:scale-105 active:scale-95">
            {tag}
          </button>
        ))}
      </div>
    </>
  );
}