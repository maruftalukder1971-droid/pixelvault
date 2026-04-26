import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Wallpaper } from "@/models/Wallpaper";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const cat = await Category.findByIdAndUpdate(id, await req.json(), { new: true });
  return NextResponse.json({ category: cat });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const inUse = await Wallpaper.countDocuments({ category: id });
  if (inUse > 0) return NextResponse.json({ error: "Move wallpapers out of this category first" }, { status: 409 });
  await Category.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}