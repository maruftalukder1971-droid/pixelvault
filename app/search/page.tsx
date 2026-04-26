import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InfiniteGallery from "@/components/InfiniteGallery";
import { Search, Smartphone, Monitor, Tv, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import type { Metadata } from "next";

type SP = { q?: string; minWidth?: string; maxWidth?: string; sort?: string; orientation?: string };

function detectFilter(sp: SP) {
  const min = sp.minWidth ? parseInt(sp.minWidth) : undefined;
  const max = sp.maxWidth ? parseInt(sp.maxWidth) : undefined;
  const ori = sp.orientation;
  const sort = sp.sort;

  if (sp.q) return { title: `"${sp.q}"`, subtitle: "Search results", icon: Search };
  if (sort === "trending") return { title: "Trending wallpapers", subtitle: "Most popular right now", icon: TrendingUp };
  if (ori === "portrait" || (min === 1080 && max && max < 1920)) {
    return { title: "Mobile wallpapers", subtitle: "Optimized for phones - portrait orientation", icon: Smartphone };
  }
  if (ori === "landscape" || (min === 1920 && (!max || max >= 1920))) {
    return { title: "Desktop wallpapers", subtitle: "Widescreen for laptops and monitors", icon: Monitor };
  }
  if (min === 3840) return { title: "4K wallpapers", subtitle: "Ultra HD 3840x2160 and above", icon: Tv };
  if (min === 2560) return { title: "QHD wallpapers", subtitle: "2560x1440 and above", icon: Monitor };
  return { title: "All wallpapers", subtitle: "Browse the full collection", icon: Sparkles };
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  const f = detectFilter(sp);
  return {
    title: f.title,
    description: f.subtitle,
    keywords: sp.q ? [`${sp.q} wallpapers`, `${sp.q} backgrounds`, `${sp.q} hd`, `${sp.q} 4k`] : []
  };
}

async function findMatchedCategory(q: string) {
  if (!q) return null;
  await connectDB();
  // Try exact match first, then partial
  const exact = await Category.findOne({ name: new RegExp(`^${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }).lean();
  if (exact) return JSON.parse(JSON.stringify(exact));
  const partial = await Category.findOne({ name: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }).lean();
  return partial ? JSON.parse(JSON.stringify(partial)) : null;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const minWidth = sp.minWidth ? parseInt(sp.minWidth) : undefined;
  const maxWidth = sp.maxWidth ? parseInt(sp.maxWidth) : undefined;
  const sort = sp.sort ?? "recent";
  const orientation = sp.orientation;
  const f = detectFilter(sp);
  const Icon = f.icon;

  const matchedCat = q ? await findMatchedCategory(q) : null;
  const showResolutionPills = !sp.q && !orientation && sort !== "trending";

  return (
    <>
      <Header />
      <section className="w-full px-3 sm:px-4 lg:px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
          <Icon className="w-4 h-4" /> {f.subtitle}
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{f.title}</h1>

        {matchedCat && (
          <Link href={`/category/${matchedCat.slug}`}
            className="group inline-flex items-center gap-3 mt-4 px-4 py-3 rounded-xl border transition-all hover:scale-[1.02]"
            style={{ background: `linear-gradient(135deg, ${matchedCat.color}25, ${matchedCat.color}10)`, borderColor: `${matchedCat.color}40` }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: matchedCat.color + "30" }}>
              <Sparkles className="w-4 h-4" style={{ color: matchedCat.color }} />
            </div>
            <div>
              <div className="text-xs text-zinc-500">Matching category</div>
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">View all {matchedCat.name} wallpapers</div>
            </div>
            <ArrowRight className="w-4 h-4 ml-2 text-zinc-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}

        {showResolutionPills && (
          <div className="flex gap-2 mt-5 mb-6 flex-wrap">
            {[
              { label: "All", val: undefined },
              { label: "HD+", val: 1920 },
              { label: "QHD+", val: 2560 },
              { label: "4K only", val: 3840 }
            ].map(p => {
              const url = new URLSearchParams();
              if (p.val) url.set("minWidth", String(p.val));
              const active = (minWidth ?? 0) === (p.val ?? 0);
              return (
                <a key={p.label} href={`/search${url.toString() ? `?${url}` : ""}`}
                  className={`px-4 py-1.5 text-sm rounded-full font-semibold transition ${active
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}>
                  {p.label}
                </a>
              );
            })}
          </div>
        )}

        <div className="mt-6">
          <InfiniteGallery params={{ q, minWidth, maxWidth, sort, orientation }} />
        </div>
      </section>
      <Footer />
    </>
  );
}