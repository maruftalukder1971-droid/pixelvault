import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Wallpaper } from "@/models/Wallpaper";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import mongoose from "mongoose";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = getClientIp(req);

  if (!rateLimit(`like:${ip}`, 30, 60_000).ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  await connectDB();

  const { id } = params;

  const { action } = await req.json().catch(() => ({ action: "like" }));
  const inc = action === "unlike" ? -1 : 1;

  const filter = mongoose.isValidObjectId(id)
    ? { _id: id }
    : { slug: id };

  const wp = await Wallpaper.findOneAndUpdate(
    filter,
    { $inc: { likes: inc } },
    { new: true }
  );

  if (!wp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    likes: Math.max(0, wp.likes)
  });
}
