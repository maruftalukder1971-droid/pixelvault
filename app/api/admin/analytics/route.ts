import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Wallpaper } from "@/models/Wallpaper";
import { Download } from "@/models/Download";
import { Category } from "@/models/Category";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  if (!(await getCurrentUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();

  const [totalWallpapers, totalsAgg] = await Promise.all([
    Wallpaper.countDocuments(),
    Wallpaper.aggregate([{
      $group: { _id: null, downloads: { $sum: "$downloads" }, views: { $sum: "$views" }, size: { $sum: "$size" } }
    }])
  ]);
  const t = totalsAgg[0] ?? { downloads: 0, views: 0, size: 0 };

  const since = new Date(Date.now() - 30 * 86_400_000);
  const trend = await Download.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, downloads: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const top = await Wallpaper.find().sort({ downloads: -1 }).limit(10).populate("category", "name color").lean();

  const cats = await Category.find().lean();
  const catMap = new Map(cats.map((c: any) => [String(c._id), c]));
  const byCategoryAgg = await Wallpaper.aggregate([
    { $group: { _id: "$category", downloads: { $sum: "$downloads" }, count: { $sum: 1 } } },
    { $sort: { downloads: -1 } }
  ]);
  const byCategory = byCategoryAgg.map((b: any) => ({ ...b, ...(catMap.get(String(b._id)) ?? {}) }));

  return NextResponse.json({ totalWallpapers, downloads: t.downloads, views: t.views, storageBytes: t.size, trend, top, byCategory });
}