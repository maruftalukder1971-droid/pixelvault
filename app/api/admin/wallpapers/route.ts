import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Wallpaper } from "@/models/Wallpaper";
import { uploadBuffer } from "@/lib/cloudinary";
import { wallpaperSchema, slugify } from "@/lib/validate";
import { getCurrentUser } from "@/lib/auth";

const MAX_FILE_BYTES = 25 * 1024 * 1024;

export async function GET(req: NextRequest) {
  if (!(await getCurrentUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));
  const [items, total] = await Promise.all([
    Wallpaper.find().populate("category", "name slug color").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Wallpaper.countDocuments()
  ]);
  return NextResponse.json({ items, total, page });
}

export async function POST(req: NextRequest) {
  if (!(await getCurrentUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
  if (file.size > MAX_FILE_BYTES) return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 413 });

  const meta = JSON.parse(String(formData.get("meta") ?? "{}"));
  const parsed = wallpaperSchema.safeParse(meta);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const upload = await uploadBuffer(buf, "pixelvault/wallpapers");

  const slug = `${slugify(parsed.data.title)}-${Date.now().toString(36)}`;
  const wp = await Wallpaper.create({
    title: parsed.data.title,
    slug,
    category: parsed.data.categoryId,
    tags: parsed.data.tags,
    cloudinaryId: upload.publicId,
    url: upload.url,
    width: upload.width,
    height: upload.height,
    size: upload.bytes,
    format: upload.format,
    featured: parsed.data.featured ?? false
  });

  return NextResponse.json({ wallpaper: wp });
}