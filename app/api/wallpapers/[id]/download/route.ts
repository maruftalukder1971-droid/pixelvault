import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Wallpaper } from "@/models/Wallpaper";
import { Download } from "@/models/Download";
import { transformUrl } from "@/lib/cloudinary";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import mongoose from "mongoose";

const RES_MAP: Record<string, number> = { mobile: 1080, hd: 1920, qhd: 2560, "4k": 3840, original: 0 };

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(req);
  if (!rateLimit(`dl:${ip}`, 60, 60_000).ok) return NextResponse.json({ error: "Slow down" }, { status: 429 });

  await connectDB();
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const res = (searchParams.get("res") ?? "hd").toLowerCase();
  const targetWidth = RES_MAP[res];

  const filter = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
  const wp = await Wallpaper.findOneAndUpdate(filter, { $inc: { downloads: 1 } }, { new: true });
  if (!wp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await Download.create({
    wallpaper: wp._id,
    resolution: res,
    ip,
    userAgent: req.headers.get("user-agent") ?? undefined
  });

  // Use original format the user uploaded (jpg, png, etc.) - NOT auto WebP/AVIF
  const useWidth = targetWidth > 0 ? Math.min(targetWidth, wp.width) : undefined;
  const url = transformUrl(wp.cloudinaryId, {
    width: useWidth,
    quality: 100,
    format: wp.format,           // keep original format (jpg/png)
    download: true,              // force download (no new tab)
    filename: `${wp.slug}-${res}`
  });

  return NextResponse.redirect(url, 302);
}