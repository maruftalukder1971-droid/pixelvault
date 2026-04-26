import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Wallpaper } from "@/models/Wallpaper";

export const revalidate = 30;

export async function GET() {
  await connectDB();
  const [cats, counts] = await Promise.all([
    Category.find().sort({ name: 1 }).lean(),
    Wallpaper.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ])
  ]);

  // Build a string-keyed map (ObjectId.toString())
  const countMap = new Map<string, number>();
  for (const c of counts) {
    if (c._id) countMap.set(String(c._id), c.count);
  }

  const categories = cats.map((c: any) => ({
    ...c,
    _id: String(c._id),
    count: countMap.get(String(c._id)) ?? 0
  }));

  return NextResponse.json({ categories });
}