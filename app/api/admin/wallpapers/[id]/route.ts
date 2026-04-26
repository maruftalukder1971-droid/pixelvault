import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Wallpaper } from "@/models/Wallpaper";
import { deleteAsset } from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const patch = await req.json();
  const allowed = ["title", "tags", "category", "featured"] as const;
  const update: Record<string, unknown> = {};
  for (const k of allowed) if (k in patch) update[k] = patch[k];
  const wp = await Wallpaper.findByIdAndUpdate(id, update, { new: true }).populate("category", "name slug color");
  if (!wp) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ wallpaper: wp });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const wp = await Wallpaper.findByIdAndDelete(id);
  if (wp) await deleteAsset(wp.cloudinaryId).catch(() => {});
  return NextResponse.json({ ok: true });
}