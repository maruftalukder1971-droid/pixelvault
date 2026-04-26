"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Menu, X, Sparkles, TrendingUp, Monitor, Smartphone, Tv, Image as ImageIcon } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type Cat = { _id: string; name: string; slug: string; color: string; count?: number };

export default function Header() {
  const [q, setQ] = useState("");
  const [cats, setCats] = useState<Cat[]>([]);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sp = searchParams.toString() ? "?" + searchParams.toString() : "";

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => setCats(d.categories ?? []));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submit = () => { if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`); };

  const navItems = [
    { label: "New", href: "/", icon: Sparkles, match: (p: string, s: string) => p === "/" && !s.includes("trending") },
    { label: "Trending", href: "/search?sort=trending", icon: TrendingUp, match: (p: string, s: string) => s.includes("trending") },
    { label: "4K", href: "/search?minWidth=3840", icon: Tv, match: (p: string, s: string) => s.includes("3840") },
    { label: "Mobile", href: "/search?orientation=portrait", icon: Smartphone, match: (p: string, s: string) => s.includes("portrait") },
    { label: "Desktop", href: "/search?orientation=landscape", icon: Monitor, match: (p: string, s: string) => s.includes("landscape") }
  ];

  return (
    <header
      className={`sticky top-0 z-40 ease-premium transition-colors duration-300 ${scrolled
        ? "bg-black/75 backdrop-blur-md border-b border-white/[0.06]"
        : "bg-black/30 backdrop-blur-sm border-b border-transparent"}`}
      style={{ transform: "translateZ(0)" }}>
      <div className="w-full px-3 sm:px-4 lg:px-6">
        {/* Top row */}
        <div className={`flex items-center gap-2 sm:gap-4 ease-premium transition-[height] duration-300 ${scrolled ? "h-14" : "h-16"}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500 flex items-center justify-center shadow-lg shadow-violet-500/40 group-hover:scale-105 ease-premium transition-transform duration-300">
                <ImageIcon className="w-4 h-4 text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white hidden sm:inline">
              Pixel<span className="gradient-text">vault</span>
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="relative group focus-ring rounded-full ease-premium transition-colors duration-200">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/0 via-fuchsia-500/40 to-rose-500/0 rounded-full opacity-0 group-focus-within:opacity-100 blur-md ease-premium transition-opacity duration-300 pointer-events-none" />
              <div className="relative flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.08] focus-within:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.14] focus-within:border-white/[0.18] rounded-full px-4 ease-premium transition-colors duration-200">
                <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Search wallpapers, tags, colors..."
                  className="flex-1 bg-transparent py-2.5 text-sm focus:outline-none placeholder:text-zinc-500 text-zinc-100 min-w-0"
                />
                {q && (
                  <button onClick={() => setQ("")} className="p-1 rounded-full hover:bg-white/10 flex-shrink-0">
                    <X className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                )}
                <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-white/5 border border-white/10 rounded">⌘K</kbd>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <button
            onClick={() => setOpen(o => !o)}
            className="lg:hidden p-2 -mr-1 text-zinc-300 hover:bg-white/5 rounded-lg ease-premium transition-colors flex-shrink-0"
            aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Desktop nav tabs (collapses when scrolled) */}
        <nav className={`hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar ease-premium transition-[height,opacity] duration-300 ${scrolled ? "h-0 opacity-0 pointer-events-none -mt-px" : "h-12 opacity-100"}`}>
          {navItems.map(it => {
            const active = it.match(pathname, sp);
            return (
              <Link key={it.label} href={it.href}
                className={`px-4 py-2 text-sm font-medium rounded-full ease-premium transition-colors duration-200 flex items-center gap-1.5 ${active
                  ? "bg-white text-black shadow-lg shadow-white/10"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"}`}>
                <it.icon className="w-3.5 h-3.5" />
                {it.label}
              </Link>
            );
          })}
          <div className="w-px h-5 bg-white/10 mx-2" />
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {cats.slice(0, 8).map(c => (
              <Link key={c._id} href={`/category/${c.slug}`}
                className="group/cat px-3 py-1.5 text-xs rounded-full ease-premium transition-colors flex items-center gap-1.5 text-zinc-500 hover:text-white hover:bg-white/5 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full ease-premium transition-transform group-hover/cat:scale-150" style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
                {c.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile drawer */}
        <div className={`lg:hidden overflow-hidden ease-premium transition-[max-height,opacity] duration-500 ${open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="py-3 space-y-3 border-t border-white/[0.06] mt-1">
            <div className="flex flex-wrap gap-1.5">
              {navItems.map(it => (
                <Link key={it.label} onClick={() => setOpen(false)} href={it.href}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-full bg-white/5 hover:bg-white/10 text-zinc-200">
                  <it.icon className="w-3 h-3" />
                  {it.label}
                </Link>
              ))}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 px-1 pt-1">Categories</div>
            <div className="grid grid-cols-2 gap-1.5">
              {cats.map(c => (
                <Link key={c._id} onClick={() => setOpen(false)} href={`/category/${c.slug}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
                  <span className="truncate text-zinc-200">{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}