import Image from "next/image";
import { Sparkles } from "lucide-react";
import HeroSearch from "./HeroSearch";

type Props = { total: number; bgImage?: string | null };

export default function Hero({ total, bgImage }: Props) {
  return (
    <section className="relative w-full min-h-[68vh] lg:min-h-[78vh] overflow-hidden flex items-center justify-center isolate">
      {/* === LAYER 1 — wallpaper backdrop, deeply blurred === */}
      {bgImage && (
        <div className="absolute inset-0 -z-30">
          <Image
            src={bgImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover scale-125 blur-3xl opacity-40"
          />
        </div>
      )}

      {/* === LAYER 2 — vignette gradient === */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-black/40 via-black/70 to-[#050507]" />

     {/* === LAYER 3 — animated gradient orbs (contained for perf) === */}
      <div className="absolute inset-0 -z-10 overflow-hidden hero-bg-layer">
        <div className="orb orb-violet" />
        <div className="orb orb-fuchsia" />
        <div className="orb orb-rose" />
      </div>

      {/* === LAYER 4 — subtle grid noise === */}
      <div className="absolute inset-0 -z-10 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px"
        }} />

      {/* === LAYER 5 — top spotlight === */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(167,139,250,0.18),transparent_70%)] -z-10 pointer-events-none" />

      {/* === CONTENT === */}
      <div className="relative w-full max-w-5xl mx-auto px-4 lg:px-6 py-16 lg:py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-full text-xs text-zinc-300 mb-7 fade-up shadow-[0_0_24px_-4px_rgba(167,139,250,0.15)]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-400" />
          </span>
          <Sparkles className="w-3 h-3 text-violet-300" />
          <span>{total.toLocaleString()} curated wallpapers</span>
          <span className="w-px h-3 bg-white/15" />
          <span className="text-zinc-400">Updated daily</span>
        </div>

        {/* Heading */}
        <h1 className="hero-heading text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-white leading-[0.95] fade-up" style={{ animationDelay: "0.08s" }}>
          Stunning wallpapers
          <br />
          <span className="hero-gradient">for every screen</span>
        </h1>

        {/* Sub */}
        <p className="text-base md:text-lg text-zinc-400 max-w-xl mx-auto mt-7 leading-relaxed fade-up" style={{ animationDelay: "0.16s" }}>
          High-resolution backgrounds in HD, QHD, and 4K. Free to download, free to dream.
        </p>

        {/* Search */}
        <div className="max-w-xl mx-auto mt-10 fade-up" style={{ animationDelay: "0.24s" }}>
          <HeroSearch />
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-5 sm:gap-7 mt-10 text-xs text-zinc-500 fade-up flex-wrap" style={{ animationDelay: "0.32s" }}>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 10px rgb(52 211 153 / 0.7)" }} />
            Free forever
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" style={{ boxShadow: "0 0 10px rgb(167 139 250 / 0.7)" }} />
            No watermarks
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" style={{ boxShadow: "0 0 10px rgb(232 121 249 / 0.7)" }} />
            Up to 4K
          </div>
        </div>
      </div>

      {/* Bottom fade into content */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-[var(--bg-deep)] pointer-events-none" />
    </section>
  );
}