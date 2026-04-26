import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");
const COOKIE_NAME = "pv_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPage = pathname.startsWith("/admin")
    && !pathname.startsWith("/admin/login")
    && !pathname.startsWith("/admin/setup")
    && !pathname.startsWith("/admin/reset");
  const isAdminApi = pathname.startsWith("/api/admin");
  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    if (isAdminApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    const res = isAdminApi
      ? NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
      : NextResponse.redirect(new URL("/admin/login", req.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };