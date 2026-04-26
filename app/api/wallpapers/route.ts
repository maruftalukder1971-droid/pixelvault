import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Wallpaper } from "@/models/Wallpaper";
import { Category } from "@/models/Category";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(48, Math.max(1, parseInt(searchParams.get("limit") ?? "24")));

  const q = searchParams.get("q")?.trim();
  const categorySlug = searchParams.get("category");
  const minWidth = parseInt(searchParams.get("minWidth") ?? "0");
  const maxWidth = parseInt(searchParams.get("maxWidth") ?? "0");
  const orientation = searchParams.get("orientation");
  const sort = searchParams.get("sort") ?? "recent";
  const featured = searchParams.get("featured") === "1";

  const filter: Record<string, any> = {};

  // ================= SEARCH =================
  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(safe, "i");

    const matchedCats = await Category.find({ name: re }).select("_id").lean();
    const catIds = matchedCats.map((c: any) => c._id);

    filter.$or = [
      { title: re },
      { tags: re },
      ...(catIds.length ? [{ category: { $in: catIds } }] : [])
    ];
  }

  // ================= CATEGORY =================
  if (categorySlug) {
    const cat = await Category.findOne({ slug: categorySlug }).lean();
    if (cat) filter.category = (cat as any)._id;
    else return NextResponse.json({ items: [], total: 0, page, hasMore: false });
  }

  // ================= WIDTH FILTER =================
  if (minWidth > 0 || maxWidth > 0) {
    const w: Record<string, number> = {};
    if (minWidth > 0) w.$gte = minWidth;
    if (maxWidth > 0) w.$lte = maxWidth;
    filter.width = w;
  }

  // ================= ORIENTATION =================
  if (orientation === "portrait") {
    filter.$expr = { $gt: ["$height", "$width"] };
  } else if (orientation === "landscape") {
    filter.$expr = { $gte: ["$width", "$height"] };
  }

  if (featured) filter.featured = true;

  const skip = (page - 1) * limit;

  // =========================================================
  // TRENDING PIPELINE
  // =========================================================
  if (sort === "trending") {
    const pipeline: any[] = [
      { $match: filter },
      {
        $addFields: {
          recencyBoost: {
            $cond: [
              { $gte: ["$createdAt", new Date(Date.now() - 30 * 86400000)] },
              1.5,
              1
            ]
          },
          baseScore: {
            $add: [
              { $multiply: [{ $ifNull: ["$likes", 0] }, 3] },
              { $multiply: [{ $ifNull: ["$downloads", 0] }, 2] },
              { $ifNull: ["$views", 0] }
            ]
          }
        }
      },
      {
        $addFields: {
          trendingScore: { $multiply: ["$baseScore", "$recencyBoost"] }
        }
      },
      { $sort: { trendingScore: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } }
    ];

    const [items, total] = await Promise.all([
      Wallpaper.aggregate(pipeline),
      Wallpaper.countDocuments(filter)
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      hasMore: skip + items.length < total
    });
  }

  // =========================================================
  // SEARCH SORT PIPELINE
  // =========================================================
  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(safe, "i");
    const exactRe = new RegExp(`^${safe}$`, "i");

    const pipeline: any[] = [
      { $match: filter },
      {
        $addFields: {
          relevance: {
            $sum: [
              { $cond: [{ $regexMatch: { input: "$title", regex: exactRe } }, 100, 0] },
              { $cond: [{ $regexMatch: { input: "$title", regex: re } }, 30, 0] },
              { $multiply: [{ $ifNull: ["$downloads", 0] }, 0.001] }
            ]
          }
        }
      },
      { $sort: { relevance: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } }
    ];

    const [items, total] = await Promise.all([
      Wallpaper.aggregate(pipeline),
      Wallpaper.countDocuments(filter)
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      hasMore: skip + items.length < total
    });
  }

  // =========================================================
  // FIXED SORT OBJECT (IMPORTANT FIX HERE)
  // =========================================================
  type SortObj = Record<string, 1 | -1>;

  let sortObj: SortObj = { createdAt: -1 };

  if (sort === "downloads") {
    sortObj = { downloads: -1 };
  } 
  else if (sort === "likes") {
    sortObj = { likes: -1, createdAt: -1 };
  } 
  else if (sort === "views") {
    sortObj = { views: -1, createdAt: -1 };
  } 
  else {
    sortObj = { createdAt: -1 };
  }

  // =========================================================
  // FINAL QUERY
  // =========================================================
  const [items, total] = await Promise.all([
    Wallpaper.find(filter)
      .populate("category", "name slug color")
      .sort(sortObj as any)
      .skip(skip)
      .limit(limit)
      .lean(),

    Wallpaper.countDocuments(filter)
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    hasMore: skip + items.length < total
  });
}
