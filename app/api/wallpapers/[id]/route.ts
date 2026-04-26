import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Wallpaper } from "@/models/Wallpaper";
import mongoose from "mongoose";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const filter = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
  const wp = await Wallpaper.findOneAndUpdate(filter, { $inc: { views: 1 } }, { new: true })
    .populate("category", "name slug color").lean();
  if (!wp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const related = await Wallpaper.find({ _id: { $ne: (wp as any)._id }, tags: { $in: (wp as any).tags } })
    .limit(8).populate("category", "name slug color").lean();

  return NextResponse.json({ wallpaper: wp, related });
}