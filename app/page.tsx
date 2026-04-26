import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import InfiniteGallery from "@/components/InfiniteGallery";
import CategoryStrip from "@/components/CategoryStrip";
import TrendingRail from "@/components/TrendingRail";
import AdSlot from "@/components/AdSlot";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Wallpaper } from "@/models/Wallpaper";
import { TrendingUp, Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

async function getData() {
  await connectDB();
  const [catsDocs, totalCount, counts, featuredDoc, trendingDocs] = await Promise.all([
    Category.find().sort({ name: 1 }).lean(),
    Wallpaper.countDocuments(),
    Wallpaper.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
    Wallpaper.findOne({ featured: true }).sort({ createdAt: -1 }).lean(),
    Wallpaper.aggregate([
      { $addFields: { score: { $add: [{ $multiply: [{ $ifNull: ["$likes", 0] }, 3] }, { $multiply: [{ $ifNull: ["$downloads", 0] }, 2] }, { $ifNull: ["$views", 0] }] } } },
      { $sort: { score: -1, createdAt: -1 } },
      { $limit: 12 },
      { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } }
    ])
  ]);

  const countMap = new Map<string, number>();
  for (const c of counts) if (c._id) countMap.set(String(c._id), c.count);
  const cats = catsDocs.map((c: any) => ({
    _id: String(c._id), name: c.name, slug: c.slug, color: c.color,
    count: countMap.get(String(c._id)) ?? 0
  }));

  const heroBg = featuredDoc ? (featuredDoc as any).url : (trendingDocs[0] ? trendingDocs[0].url : null);
  const trending = JSON.parse(JSON.stringify(trendingDocs));

  return { cats, total: totalCount, heroBg, trending };
}

export default async function HomePage() {
  const { cats, total, heroBg, trending } = await getData();
  return (
    <>
      <Header />

      <Hero total={total} bgImage={heroBg} />

      <CategoryStrip cats={cats} />

      {trending.length > 0 && (
        <section className="w-full px-3 sm:px-4 lg:px-6 pt-12">
          <div className="flex items-center justify-between mb-5 px-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Trending now</h2>
                <p className="text-xs text-zinc-500">Most popular this week</p>
              </div>
            </div>
            <a href="/search?sort=trending" className="text-xs text-zinc-400 hover:text-white ease-premium transition flex items-center gap-1">
              View all →
            </a>
          </div>
          <TrendingRail items={trending} />
        </section>
      )}

      <AdSlot slot="home-mid" className="max-w-5xl mx-auto h-24 my-12 mx-4" />

      <section className="w-full px-3 sm:px-4 lg:px-6 pb-12">
        <div className="flex items-center gap-3 mb-5 px-1">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-zinc-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Latest uploads</h2>
            <p className="text-xs text-zinc-500">Fresh wallpapers, every day</p>
          </div>
        </div>
        <InfiniteGallery params={{ sort: "recent" }} />
      </section>

      <Footer />
    </>
  );
}