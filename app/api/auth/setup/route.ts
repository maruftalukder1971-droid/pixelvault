import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth";
import { setupBeginSchema, setupCompleteSchema, checkPasswordStrength } from "@/lib/validate";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { generateTotpSecret, buildOtpAuthUrl, buildQrDataUrl, verifyTotp, generateRecoveryCodes, hashRecoveryCodes } from "@/lib/totp";
import { encrypt } from "@/lib/crypto";
import crypto from "crypto";

// In-memory pending-setup store (keyed by setupId, expires in 10 min)
const pending = new Map<string, { username: string; secret: string; expires: number }>();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of pending) if (v.expires < now) pending.delete(k);
}, 60_000);

export async function GET() {
  await connectDB();
  const adminCount = await User.countDocuments({ role: "admin" });
  return NextResponse.json({ needsSetup: adminCount === 0 });
}

// Step 1: generate TOTP secret + QR (not saved to DB until step 2)
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimit(`setup:${ip}`, 5, 60_000).ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  await connectDB();
  if ((await User.countDocuments({ role: "admin" })) > 0) {
    return NextResponse.json({ error: "Setup already completed" }, { status: 403 });
  }

  const parsed = setupBeginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const setupId = crypto.randomBytes(16).toString("hex");
  const secret = generateTotpSecret();
  pending.set(setupId, { username: parsed.data.username.toLowerCase(), secret, expires: Date.now() + 10 * 60_000 });

  const otpUrl = buildOtpAuthUrl(parsed.data.username, secret);
  const qr = await buildQrDataUrl(otpUrl);
  return NextResponse.json({ setupId, qr, secret, otpUrl });
}

// Step 2: verify TOTP + create user, return recovery codes
export async function PUT(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimit(`setup:${ip}`, 10, 60_000).ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  await connectDB();
  if ((await User.countDocuments({ role: "admin" })) > 0) {
    return NextResponse.json({ error: "Setup already completed" }, { status: 403 });
  }

  const parsed = setupCompleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const session = pending.get(parsed.data.setupId);
  if (!session || session.expires < Date.now()) return NextResponse.json({ error: "Setup session expired. Restart." }, { status: 400 });

  if (!verifyTotp(parsed.data.totpToken, session.secret)) {
    return NextResponse.json({ error: "Invalid 2FA code. Make sure your device clock is correct." }, { status: 401 });
  }

  const strength = checkPasswordStrength(parsed.data.password);
  if (!strength.valid) return NextResponse.json({ error: "Password does not meet strength requirements" }, { status: 400 });

  const passwordHash = await hashPassword(parsed.data.password);
  const recoveryCodes = generateRecoveryCodes(10);
  const recoveryCodeHashes = await hashRecoveryCodes(recoveryCodes);

  const user = await User.create({
    username: session.username,
    passwordHash,
    role: "admin",
    totpSecretEnc: encrypt(session.secret),
    recoveryCodeHashes
  });

  pending.delete(parsed.data.setupId);

  const token = signToken({ sub: user.id, username: user.username, role: user.role });
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, recoveryCodes });
}