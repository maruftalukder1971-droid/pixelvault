import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InfiniteGallery from "@/components/InfiniteGallery";
import AdSlot from "@/components/AdSlot";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const cat = await Category.findOne({ slug }).lean();
  if (!cat) return { title: "Not found" };
  const name = (cat as any).name;
  const lower = name.toLowerCase();
  return {
    title: `${name} Wallpapers - HD, QHD and 4K - Free Download`,
    description: `Download free ${lower} wallpapers in HD, QHD, and 4K resolutions. Browse our curated collection of high-quality ${lower} backgrounds for desktop and mobile.`,
    keywords: [
      `${lower} wallpapers`, `${lower} backgrounds`, `${lower} hd`, `${lower} 4k`,
      `${lower} desktop wallpaper`, `${lower} mobile wallpaper`, `${lower} phone wallpaper`,
      `free ${lower} wallpapers`, `${lower} 1080p`, `${lower} 1920x1080`, `${lower} 4k wallpaper`
    ],
    openGraph: {
      title: `${name} Wallpapers - HD and 4K Free Downloads`,
      description: `Free ${lower} wallpapers in HD, QHD, and 4K. Curated daily.`,
      type: "website"
    }
  };
}
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  const catDoc = await Category.findOne({ slug }).lean();
  if (!catDoc) notFound();
  const c = JSON.parse(JSON.stringify(catDoc));
  return (
    <>
      <Header />
      <AdSlot slot="header-banner" className="max-w-7xl mx-auto h-[90px] my-4 mx-4 lg:mx-auto" />
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: c.color + "20", border: `1px solid ${c.color}40` }}>
            <span className="w-3 h-3 rounded-full" style={{ background: c.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{c.name} wallpapers</h1>
            <div className="text-xs text-zinc-500">Curated - refreshed daily</div>
          </div>
        </div>
        <div className="mt-6">
          <InfiniteGallery params={{ category: slug, sort: "recent" }} />
        </div>
      </section>
      <Footer />
    </>
  );
}