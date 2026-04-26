import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-20 py-12 bg-[var(--bg-deep)]">
      <div className="w-full px-4 lg:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight">Pixel<span className="gradient-text">vault</span></span>
            </div>
            <p className="text-sm text-zinc-500 max-w-md">
              Stunning HD, QHD and 4K wallpapers for every screen. Curated daily, free forever.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-zinc-300">Resolutions</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link href="/search?minWidth=3840" className="hover:text-violet-400 ease-premium transition">4K Ultra HD</Link></li>
              <li><Link href="/search?minWidth=2560" className="hover:text-violet-400 ease-premium transition">QHD</Link></li>
              <li><Link href="/search?minWidth=1920" className="hover:text-violet-400 ease-premium transition">Full HD</Link></li>
              <li><Link href="/search?orientation=portrait" className="hover:text-violet-400 ease-premium transition">Mobile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-zinc-300">Discover</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link href="/" className="hover:text-violet-400 ease-premium transition">Latest</Link></li>
              <li><Link href="/search?sort=trending" className="hover:text-violet-400 ease-premium transition">Trending</Link></li>
              <li><Link href="/sitemap.xml" className="hover:text-violet-400 ease-premium transition">Sitemap</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.04] pt-6 text-xs text-zinc-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} PixelVault. All rights reserved.</span>
          <Link href="/admin" className="hover:text-zinc-400 ease-premium transition">Admin</Link>
        </div>
      </div>
    </footer>
  );
}