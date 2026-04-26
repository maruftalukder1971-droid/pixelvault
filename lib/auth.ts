import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "pv_session";
const TOKEN_TTL = "7d";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be set and at least 32 characters");
}

export type SessionPayload = { sub: string; username: string; role: "admin" | "editor" };

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}
export function verifyToken(token: string): SessionPayload | null {
  try { return jwt.verify(token, JWT_SECRET) as SessionPayload; } catch { return null; }
}
export async function setSessionCookie(token: string) {
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE
  });
}
export async function clearSessionCookie() {
  (await cookies()).delete(COOKIE_NAME);
}
export async function getCurrentUser(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}
export function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get(COOKIE_NAME)?.value ?? null;
}