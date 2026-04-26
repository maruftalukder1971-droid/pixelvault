import { connectDB } from "@/lib/mongodb";
import { Wallpaper } from "@/models/Wallpaper";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WallpaperCard from "@/components/WallpaperCard";
import AdSlot from "@/components/AdSlot";
import DownloadButtons from "@/components/DownloadButtons";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

function plain<T>(doc: any): T {
  return JSON.parse(JSON.stringify(doc));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const wp = await Wallpaper.findOne({ slug }).lean();
  if (!wp) return { title: "Not found" };
  const w = wp as any;
  return {
    title: `${w.title} - ${w.width}x${w.height} Wallpaper`,
    description: `Download ${w.title} in HD, QHD, and 4K. Free for personal use.`,
    openGraph: { images: [{ url: w.url, width: w.width, height: w.height }] }
  };
}

export default async function WallpaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  const wpDoc = await Wallpaper.findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { new: true })
    .populate("category", "name slug color").lean();
  if (!wpDoc) notFound();
  const w = plain<any>(wpDoc);

  const relatedDocs = await Wallpaper.find({ _id: { $ne: wpDoc._id }, $or: [{ tags: { $in: w.tags } }, { category: w.category._id }] })
    .limit(8).populate("category", "name slug color").lean();
  const related = plain<any[]>(relatedDocs);

  return (
    <>
      <Header />
      <article className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
        <div className="text-xs text-zinc-500 mb-3">
          <Link href="/" className="hover:text-zinc-300">Home</Link> {" / "}
          <Link href={`/category/${w.category.slug}`} className="hover:text-zinc-300">{w.category.name}</Link>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-zinc-900 mb-5" style={{ aspectRatio: `${w.width}/${w.height}` }}>
          <Image src={w.url} alt={w.title} fill priority sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{w.title}</h1>
            <div className="flex items-center gap-3 text-sm text-zinc-500 mt-2">
              <span className="font-mono">{w.width} x {w.height}</span> {" - "} <span>{(w.size/1e6).toFixed(1)} MB</span>
              <span>{" - "} {w.downloads.toLocaleString()} downloads</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {w.tags.map((t: string) => (
                <Link key={t} href={`/search?q=${encodeURIComponent(t)}`}
                  className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full transition">#{t}</Link>
              ))}
            </div>

<DownloadButtons id={w._id.toString()} maxWidth={w.width} initialLikes={w.likes ?? 0} initialDownloads={w.downloads ?? 0} />          </div>
          <div className="space-y-4">
            <AdSlot slot="sidebar" className="h-[280px]" />
          </div>
        </div>

        <h2 className="text-lg font-semibold tracking-tight mb-3">Related wallpapers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {related.map((r: any) => <WallpaperCard key={r._id} w={r} />)}
        </div>
      </article>
      <Footer />
    </>
  );
}