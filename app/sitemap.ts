import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/mongodb";
import { Wallpaper } from "@/models/Wallpaper";
import { Category } from "@/models/Category";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  const [wps, cats] = await Promise.all([
    Wallpaper.find().select("slug updatedAt").lean(),
    Category.find().select("slug updatedAt").lean()
  ]);
  return [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/search`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/search?sort=trending`, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/search?orientation=portrait`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/search?orientation=landscape`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/search?minWidth=3840`, changeFrequency: "weekly", priority: 0.7 },
    ...cats.map((c: any) => ({
      url: `${BASE}/category/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.85
    })),
    ...wps.map((w: any) => ({
      url: `${BASE}/wallpaper/${w.slug}`,
      lastModified: w.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6
    }))
  ];
}