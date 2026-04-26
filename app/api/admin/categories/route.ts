import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { categorySchema, slugify } from "@/lib/validate";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await getCurrentUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const parsed = categorySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  try {
    const cat = await Category.create({ ...parsed.data, slug: slugify(parsed.data.name) });
    return NextResponse.json({ category: cat });
  } catch (e: any) {
    if (e.code === 11000) return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    throw e;
  }
}